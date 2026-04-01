"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { fallbackSkills } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import type { Booking, Skill } from "@/types";

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

  async function handleBook(formData: FormData) {
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
          scheduledAt: formData.get("scheduledAt"),
          notes: formData.get("notes")
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
        <div className="panel">
          <span className="eyebrow">Booking summary</span>
          <h1>{skill.title}</h1>
          <p>{skill.description}</p>
          <div className="stack" style={{ marginTop: 18 }}>
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
          <form
            className="form-grid"
            action={(formData) => {
              void handleBook(formData);
            }}
          >
            <label>
              Session date and time
              <input name="scheduledAt" type="datetime-local" required />
            </label>
            <label>
              Notes or questions
              <textarea name="notes" placeholder="Mention your current level, goals, or links you want reviewed." />
            </label>
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
