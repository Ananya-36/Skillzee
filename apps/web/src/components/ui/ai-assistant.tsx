"use client";

import Link from "next/link";
import { MessageSquareMore, SendHorizontal, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { AssistantResponse, Skill } from "@/types";

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  recommendations?: Skill[];
  provider?: AssistantResponse["provider"];
};

export function AiAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "assistant-intro",
      role: "assistant",
      text: "Need help choosing a class? Ask about design, coding, analytics, interviews, or budget."
    }
  ]);

  async function handleSubmit() {
    const nextPrompt = prompt.trim();

    if (!nextPrompt || loading) {
      return;
    }

    setLoading(true);
    setPrompt("");
    setMessages((current) => [
      ...current,
      {
        id: `user-${crypto.randomUUID()}`,
        role: "user",
        text: nextPrompt
      }
    ]);

    try {
      const response = await apiRequest<AssistantResponse>("/assistant/chat", {
        method: "POST",
        body: JSON.stringify({
          message: nextPrompt,
          userId: user?._id,
          interests: user?.interests ?? []
        })
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${crypto.randomUUID()}`,
          role: "assistant",
          text: response.reply,
          recommendations: response.recommendations,
          provider: response.provider
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${crypto.randomUUID()}`,
          role: "assistant",
          text: "I couldn't reach the class assistant just now, but I can still suggest design, analytics, interview prep, or video editing sessions from the marketplace."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`assistant-shell ${open ? "assistant-shell--open" : ""}`}>
      {open ? (
        <section className="assistant-panel">
          <div className="assistant-panel__header">
            <div>
              <span className="eyebrow">AI Guide</span>
              <h3>Find your next class</h3>
            </div>
            <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={16} />
            </button>
          </div>

          <div className="assistant-messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`assistant-bubble ${message.role === "user" ? "assistant-bubble--user" : ""}`}
              >
                <strong>{message.role === "user" ? "You" : "SkillSwap AI"}</strong>
                <p>{message.text}</p>
                {message.provider ? <span className="pill">{message.provider}</span> : null}
                {message.recommendations?.length ? (
                  <div className="assistant-links">
                    {message.recommendations.map((skill) => (
                      <Link key={skill._id} href={`/skills/${skill._id}`} className="pill">
                        {skill.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>

          <div className="assistant-panel__composer">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Ask: I like design, what should I learn next?"
            />
            <button type="button" className="button button--primary" onClick={() => void handleSubmit()} disabled={loading}>
              <SendHorizontal size={16} />
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>
        </section>
      ) : null}

      <button type="button" className="assistant-launcher" onClick={() => setOpen((current) => !current)}>
        <Sparkles size={18} />
        <MessageSquareMore size={18} />
        AI class assistant
      </button>
    </div>
  );
}
