"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { fallbackBookings, fallbackMessages } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/format";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/hooks/use-auth";
import type { Booking, Message } from "@/types";

type Conversation = Booking & { latestMessage?: Message | null };

export default function ChatPage() {
  return (
    <Suspense fallback={<section className="container page-header"><div className="panel">Loading chat...</div></section>}>
      <ChatPageContent />
    </Suspense>
  );
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(fallbackBookings);
  const [activeBookingId, setActiveBookingId] = useState(searchParams.get("booking") ?? fallbackBookings[0]._id);
  const [messages, setMessages] = useState<Message[]>(fallbackMessages);
  const activeConversation = useMemo(
    () => conversations.find((item) => item._id === activeBookingId) ?? conversations[0],
    [activeBookingId, conversations]
  );

  useEffect(() => {
    if (!token) {
      setConversations(fallbackBookings);
      setMessages(fallbackMessages);
      return;
    }

    void apiRequest<Conversation[]>("/chat/conversations", { token })
      .then((data) => setConversations(data.length ? data : fallbackBookings))
      .catch(() => setConversations(fallbackBookings));
  }, [token]);

  useEffect(() => {
    if (!activeBookingId) {
      return;
    }

    if (!token) {
      setMessages(fallbackMessages);
      return;
    }

    void apiRequest<Message[]>(`/chat/${activeBookingId}/messages`, { token })
      .then((data) => setMessages(data))
      .catch(() => setMessages(fallbackMessages));

    const socket = getSocket(token);
    socket.emit("chat:join", activeBookingId);

    const handleMessage = (message: Message) => {
      if (message.booking === activeBookingId) {
        setMessages((current) => [...current, message]);
      }
    };

    socket.on("chat:message", handleMessage);

    return () => {
      socket.off("chat:message", handleMessage);
    };
  }, [activeBookingId, token]);

  async function sendMessage(formData: FormData) {
    const content = String(formData.get("content")).trim();

    if (!content || !activeConversation) {
      return;
    }

    if (!token || !user) {
      setMessages((current) => [
        ...current,
        {
          _id: crypto.randomUUID(),
          booking: activeConversation._id,
          sender: {
            _id: user?._id ?? "user-demo",
            name: user?.name ?? "You",
            avatarUrl: user?.avatarUrl ?? fallbackBookings[0].learner.avatarUrl
          },
          recipient: {
            _id: activeConversation.trainer._id,
            name: activeConversation.trainer.name,
            avatarUrl: activeConversation.trainer.avatarUrl
          },
          content,
          createdAt: new Date().toISOString()
        }
      ]);
      return;
    }

    const newMessage = await apiRequest<Message>(`/chat/${activeConversation._id}/messages`, {
      method: "POST",
      token,
      body: JSON.stringify({ content })
    });

    setMessages((current) => [...current, newMessage]);
  }

  return (
    <section className="container page-header">
      <div className="page-header">
        <span className="eyebrow">Realtime chat</span>
        <h1>Talk inside Skillzee before switching to WhatsApp or email.</h1>
      </div>

      <div className="chat-layout">
        <aside className="chat-panel stack">
          {conversations.map((conversation) => (
            <button
              type="button"
              key={conversation._id}
              className="timeline-card"
              onClick={() => setActiveBookingId(conversation._id)}
              style={{
                textAlign: "left",
                background: conversation._id === activeBookingId ? "rgba(124,108,255,0.12)" : undefined
              }}
            >
              <h3>{conversation.skill.title}</h3>
              <p>{conversation.trainer.name}</p>
              <span className="muted">{formatDateTime(conversation.scheduledAt)}</span>
            </button>
          ))}
        </aside>

        <div className="chat-panel stack">
          <div>
            <h2>{activeConversation?.skill.title ?? "Conversation"}</h2>
            <p className="muted">Chat history is stored per booking for clarity and trust.</p>
          </div>
          <div className="stack">
            {messages.map((message) => {
              const mine = message.sender._id === user?._id;
              return (
                <article
                  key={message._id}
                  className="glass-card"
                  style={{ marginLeft: mine ? "auto" : 0, maxWidth: "80%" }}
                >
                  <strong>{mine ? "You" : message.sender.name}</strong>
                  <p>{message.content}</p>
                  <span className="muted">{formatDateTime(message.createdAt)}</span>
                </article>
              );
            })}
          </div>
          <form
            className="panel-actions"
            action={(formData) => {
              void sendMessage(formData);
            }}
          >
            <input name="content" placeholder="Send a message..." />
            <button className="button button--primary" type="submit">
              <SendHorizontal size={16} />
              Send
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
