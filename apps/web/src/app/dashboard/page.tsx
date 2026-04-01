"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, PlusCircle, Sparkles, Wallet2 } from "lucide-react";
import { SkillCard } from "@/components/ui/skill-card";
import { VideoRoom } from "@/components/ui/video-room";
import { apiRequest } from "@/lib/api";
import { fallbackBookings, fallbackNotifications, fallbackSkills, fallbackWallet } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { subscribeToPush } from "@/lib/pwa";
import { useAuth } from "@/hooks/use-auth";
import type { Booking, NotificationItem, Skill, WalletResponse } from "@/types";

export default function DashboardPage() {
  const { token, user, refreshUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(fallbackBookings);
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);
  const [wallet, setWallet] = useState<WalletResponse>(fallbackWallet);
  const [recommended, setRecommended] = useState<Skill[]>(fallbackSkills);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setBookings(fallbackBookings);
      setNotifications(fallbackNotifications);
      setWallet(fallbackWallet);
      setRecommended(fallbackSkills);
      return;
    }

    void Promise.all([
      apiRequest<Booking[]>("/bookings", { token }).catch(() => fallbackBookings),
      apiRequest<NotificationItem[]>("/notifications", { token }).catch(() => fallbackNotifications),
      apiRequest<WalletResponse>("/payments/wallet", { token }).catch(() => fallbackWallet),
      apiRequest<Skill[]>("/skills/recommended", { token }).catch(() => fallbackSkills)
    ]).then(([nextBookings, nextNotifications, nextWallet, nextRecommended]) => {
      setBookings(nextBookings);
      setNotifications(nextNotifications);
      setWallet(nextWallet);
      setRecommended(nextRecommended);
    });
  }, [token]);

  const inAppBooking = useMemo(
    () => bookings.find((booking) => booking.sessionType === "IN_APP" && booking.videoRoomId),
    [bookings]
  );

  async function createSkill(formData: FormData) {
    if (!token) {
      setMessage("Sign in with a trainer or both-role account to create skills.");
      return;
    }

    try {
      await apiRequest("/skills", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          category: formData.get("category"),
          price: Number(formData.get("price")),
          durationMinutes: Number(formData.get("durationMinutes")),
          mode: formData.get("mode"),
          sessionType: formData.get("sessionType"),
          meetLink: formData.get("meetLink"),
          tags: String(formData.get("tags"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          availability: String(formData.get("availability"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });
      setMessage("Skill created successfully.");
      await refreshUser();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create skill");
    }
  }

  async function enablePush() {
    if (!token) {
      setMessage("Sign in to enable browser notifications.");
      return;
    }

    try {
      const subscription = await subscribeToPush();

      if (subscription) {
        await apiRequest("/notifications/subscribe", {
          method: "POST",
          token,
          body: JSON.stringify(subscription)
        });
      }

      setMessage("Browser notifications enabled.");
    } catch {
      setMessage("Push notification setup could not complete on this browser.");
    }
  }

  return (
    <section className="container page-header">
      <div className="page-header">
        <span className="eyebrow">Dashboard</span>
        <h1>See bookings, earnings, recommendations, and realtime alerts in one place.</h1>
      </div>

      <div className="cards-grid">
        <article className="metric-card">
          <span>Available wallet</span>
          <strong>{formatCurrency(wallet.user.wallet.availableBalance)}</strong>
          <p>Released trainer payouts you can withdraw.</p>
        </article>
        <article className="metric-card">
          <span>Pending</span>
          <strong>{formatCurrency(wallet.user.wallet.pendingBalance)}</strong>
          <p>Earnings waiting for session completion.</p>
        </article>
        <article className="metric-card">
          <span>Total spent</span>
          <strong>{formatCurrency(wallet.user.wallet.totalSpent)}</strong>
          <p>Your learner-side spend across Skillzee.</p>
        </article>
      </div>

      <div className="dashboard-grid section">
        <div className="stack">
          <article className="panel">
            <div className="panel-actions" style={{ justifyContent: "space-between" }}>
              <div>
                <span className="eyebrow">Upcoming bookings</span>
                <h2>Session pipeline</h2>
              </div>
              <Link href="/chat" className="button button--ghost">
                Open chat
              </Link>
            </div>
            <div className="stack" style={{ marginTop: 18 }}>
              {bookings.map((booking) => (
                <article key={booking._id} className="timeline-card">
                  <div className="panel-actions" style={{ justifyContent: "space-between" }}>
                    <div>
                      <h3>{booking.skill.title}</h3>
                      <p>
                        {formatDateTime(booking.scheduledAt)} • {booking.status}
                      </p>
                    </div>
                    <span className="pill">{booking.sessionType}</span>
                  </div>
                  <div className="panel-actions">
                    {booking.sessionLink ? (
                      <a className="button button--primary" href={booking.sessionLink} target="_blank" rel="noreferrer">
                        Join Google Meet
                      </a>
                    ) : null}
                    <Link href={`/chat?booking=${booking._id}`} className="button button--ghost">
                      Message participant
                    </Link>
                    {booking.status === "COMPLETED" && token ? (
                      <a
                        className="button button--ghost"
                        href={`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"}/bookings/${booking._id}/certificate`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download certificate
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </article>

          {inAppBooking && token ? (
            <VideoRoom bookingId={inAppBooking._id} roomId={inAppBooking.videoRoomId ?? inAppBooking._id} token={token} />
          ) : null}

          <article className="panel">
            <div className="panel-actions" style={{ justifyContent: "space-between" }}>
              <div>
                <span className="eyebrow">Recommended</span>
                <h2>AI-guided next skills</h2>
              </div>
              <Sparkles size={18} />
            </div>
            <div className="stack" style={{ marginTop: 18 }}>
              {recommended.slice(0, 2).map((skill) => (
                <SkillCard key={skill._id} skill={skill} compact />
              ))}
            </div>
          </article>
        </div>

        <div className="stack">
          <article className="panel">
            <div className="panel-actions" style={{ justifyContent: "space-between" }}>
              <div>
                <span className="eyebrow">Notifications</span>
                <h2>Realtime alerts</h2>
              </div>
              <button type="button" className="button button--ghost" onClick={() => void enablePush()}>
                <BellRing size={16} />
                Enable push
              </button>
            </div>
            <div className="stack" style={{ marginTop: 18 }}>
              {notifications.map((notification) => (
                <article key={notification._id} className="timeline-card">
                  <strong>{notification.title}</strong>
                  <p>{notification.body}</p>
                </article>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-actions" style={{ justifyContent: "space-between" }}>
              <div>
                <span className="eyebrow">Trainer tools</span>
                <h2>Create a skill listing</h2>
              </div>
              <PlusCircle size={18} />
            </div>
            <form
              className="form-grid"
              style={{ marginTop: 18 }}
              action={(formData) => {
                void createSkill(formData);
              }}
            >
              <label>
                Title
                <input name="title" required />
              </label>
              <label>
                Description
                <textarea name="description" required />
              </label>
              <div className="form-grid form-grid--two">
                <label>
                  Category
                  <input name="category" required />
                </label>
                <label>
                  Price
                  <input name="price" type="number" min="1" required />
                </label>
              </div>
              <div className="form-grid form-grid--two">
                <label>
                  Duration in minutes
                  <input name="durationMinutes" type="number" min="15" required />
                </label>
                <label>
                  Mode
                  <select name="mode" defaultValue="ONLINE">
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </label>
              </div>
              <div className="form-grid form-grid--two">
                <label>
                  Session type
                  <select name="sessionType" defaultValue="GOOGLE_MEET">
                    <option value="GOOGLE_MEET">Google Meet</option>
                    <option value="IN_APP">In-app video</option>
                  </select>
                </label>
                <label>
                  Meet link
                  <input name="meetLink" type="url" placeholder="https://meet.google.com/..." />
                </label>
              </div>
              <label>
                Tags
                <input name="tags" placeholder="figma, ui, portfolio" />
              </label>
              <label>
                Availability
                <input name="availability" placeholder="Mon 7 PM, Wed 6 PM" />
              </label>
              <button className="button button--primary" type="submit">
                <Wallet2 size={16} />
                Publish listing
              </button>
            </form>
            {message ? <p className="muted">{message}</p> : null}
          </article>
        </div>
      </div>
    </section>
  );
}
