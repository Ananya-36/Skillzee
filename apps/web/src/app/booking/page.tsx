"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { apiRequest } from "@/lib/api";
import { buildEmailLink } from "@/lib/communication";
import { fallbackSkills } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { getAvatarSrc } from "@/lib/presentation";
import { useAuth } from "@/hooks/use-auth";
import type { Booking, Skill } from "@/types";

type PaymentMethod = "RAZORPAY_UPI" | "UPI_COLLECT" | "SKILLSWAP_WALLET";

function toLocalDateTimeValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function generateQuickSlots() {
  const now = new Date();

  return [1, 2, 3, 4, 5].map((index) => {
    const slot = new Date(now);
    slot.setDate(now.getDate() + index);
    slot.setHours(index % 2 === 0 ? 18 : 20, index % 2 === 0 ? 0 : 30, 0, 0);

    return {
      value: toLocalDateTimeValue(slot),
      label: new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(slot)
    };
  });
}

export default function BookingPage() {
  return (
    <Suspense fallback={<section className="container page-header"><div className="panel">Loading booking...</div></section>}>
      <BookingPageContent />
    </Suspense>
  );
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skillId = searchParams.get("skillId") ?? fallbackSkills[0]._id;
  const { token } = useAuth();
  const [skill, setSkill] = useState<Skill>(fallbackSkills[0]);
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("RAZORPAY_UPI");
  const quickSlots = useMemo(() => generateQuickSlots(), []);
  const [scheduledAt, setScheduledAt] = useState(quickSlots[0]?.value ?? "");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    void apiRequest<{ skill: Skill }>(`/skills/${skillId}`)
      .then((data) => setSkill(data.skill))
      .catch(() => setSkill(fallbackSkills.find((item) => item._id === skillId) ?? fallbackSkills[0]));
  }, [skillId]);

  const split = useMemo(() => {
    const platformCommission = Math.round(skill.price * 0.2);
    const trainerPayout = skill.price - platformCommission;

    return {
      total: skill.price,
      platformCommission,
      trainerPayout
    };
  }, [skill.price]);
  const trainerWhatsApp = skill.trainer.whatsAppNumber || skill.trainer.phone;

  async function handleBook(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setMessage("Please sign in before booking a session.");
      return;
    }

    try {
      const booking = await apiRequest<Booking>("/bookings", {
        method: "POST",
        token,
        body: JSON.stringify({
          skillId: skill._id,
          scheduledAt,
          notes,
          paymentMethod
        })
      });

      router.push(`/dashboard?booking=${booking._id}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Booking failed");
    }
  }

  return (
    <section className="container page-header">
      <div className="split-layout">
        <div className="panel stack">
          <span className="eyebrow">Booking summary</span>
          <h1>{skill.title}</h1>
          <p>{skill.description}</p>
          <div className="stack">
            <article className="timeline-card">
              <h3>Calendar slots</h3>
              <div className="pill-row" style={{ marginTop: 12 }}>
                {quickSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    className={`button ${scheduledAt === slot.value ? "button--primary" : "button--ghost"}`}
                    onClick={() => setScheduledAt(slot.value)}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </article>
            <article className="timeline-card">
              <h3>Payment simulation</h3>
              <p>Use the built-in Razorpay or UPI simulation to complete the booking flow for demos and presentations.</p>
            </article>
            <article className="timeline-card">
              <h3>What happens after you book</h3>
              <p>The provider gets a realtime dashboard notification, and both sides receive an automated email confirmation.</p>
            </article>
            <article className="timeline-card">
              <h3>Direct contact bridge</h3>
              <p>WhatsApp, email, and the in-app chat stay one click away from this booking flow.</p>
              <div className="panel-actions" style={{ marginTop: 12 }}>
                <WhatsAppLink phone={trainerWhatsApp} skillTitle={skill.title} label="WhatsApp trainer" />
                <a
                  className="button button--ghost"
                  href={buildEmailLink(
                    skill.trainer.email,
                    `SkillSwap booking question: ${skill.title}`,
                    `Hi, I am interested in your ${skill.title} class on SkillSwap.`
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Mail size={16} />
                  Email trainer
                </a>
              </div>
            </article>
          </div>
          <div className="cards-grid">
            <article className="timeline-card">
              <h3>Total paid by learner</h3>
              <strong>{formatCurrency(split.total)}</strong>
            </article>
            <article className="timeline-card">
              <h3>Platform commission</h3>
              <strong>{formatCurrency(split.platformCommission)}</strong>
            </article>
            <article className="timeline-card">
              <h3>Trainer receives</h3>
              <strong>{formatCurrency(split.trainerPayout)}</strong>
            </article>
          </div>
        </div>

        <div className="form-panel">
          <form className="form-grid" onSubmit={(event) => void handleBook(event)}>
            <label>
              Session date and time
              <input value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} type="datetime-local" required />
            </label>
            <label>
              Payment method
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                <option value="RAZORPAY_UPI">Razorpay / UPI Simulation</option>
                <option value="UPI_COLLECT">UPI Collect Simulation</option>
                <option value="SKILLSWAP_WALLET">SkillSwap Wallet Simulation</option>
              </select>
            </label>
            <label>
              Availability notes from trainer
              <textarea readOnly value={(skill.availability ?? []).join(", ") || "Flexible schedule"} />
            </label>
            <label>
              Booking notes
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Share your goals, current level, or anything the trainer should prepare."
              />
            </label>
            <article className="timeline-card">
              <h3>Provider</h3>
              <div className="skill-card__trainer" style={{ marginTop: 12 }}>
                <img src={getAvatarSrc(skill.trainer.name, skill.trainer.avatarUrl)} alt={skill.trainer.name} />
                <div>
                  <strong>{skill.trainer.name}</strong>
                  <span>{skill.trainer.college}</span>
                </div>
              </div>
            </article>
            <button className="button button--primary" type="submit">
              Confirm booking
            </button>
          </form>
          {message ? <p className="muted">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
