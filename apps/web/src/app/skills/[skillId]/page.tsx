"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock, MessageCircleMore, Star } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { buildEmailLink, openWhatsAppChat } from "@/lib/communication";
import { fallbackReviews, fallbackSkills } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import type { Review, Skill } from "@/types";

export default function SkillDetailsPage() {
  const params = useParams<{ skillId: string }>();
  const [skill, setSkill] = useState<Skill>(fallbackSkills[0]);
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);

  useEffect(() => {
    void apiRequest<{ skill: Skill; reviews: Review[] }>(`/skills/${params.skillId}`)
      .then((data) => {
        setSkill(data.skill);
        setReviews(data.reviews);
      })
      .catch(() => {
        const fallback = fallbackSkills.find((item) => item._id === params.skillId) ?? fallbackSkills[0];
        setSkill(fallback);
        setReviews(fallbackReviews);
      });
  }, [params.skillId]);

  return (
    <section className="container page-header">
      <div className="detail-grid">
        <div className="panel stack">
          <span className="eyebrow">{skill.category}</span>
          <h1>{skill.title}</h1>
          <p>{skill.description}</p>
          <div className="skill-card__stats">
            <span>
              <Star size={16} /> {skill.ratingAverage.toFixed(1)} from {skill.ratingCount} ratings
            </span>
            <span>{formatCurrency(skill.price)}</span>
            <span>{skill.durationMinutes} minutes</span>
            <span>{skill.mode}</span>
            <span>{skill.sessionType === "IN_APP" ? "In-app video" : "Google Meet"}</span>
          </div>

          <div className="glass-card">
            <h3>What this session includes</h3>
            <div className="pill-row" style={{ marginTop: 12 }}>
              {(skill.tags ?? []).map((tag) => (
                <span key={tag} className="pill">
                  {tag}
                </span>
              ))}
            </div>
            <div className="stack" style={{ marginTop: 16 }}>
              {(skill.availability ?? ["Flexible schedule"]).map((slot) => (
                <div key={slot} className="timeline-step">
                  <span>
                    <CalendarClock size={18} />
                  </span>
                  <div>
                    <h3>{slot}</h3>
                    <p>Book this slot and coordinate inside chat, WhatsApp, or email instantly.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <article className="panel">
            <h2>Reviews</h2>
            <div className="stack" style={{ marginTop: 18 }}>
              {reviews.map((review) => (
                <article key={review._id} className="timeline-card">
                  <div className="skill-card__trainer">
                    <img src={review.learner.avatarUrl} alt={review.learner.name} />
                    <div>
                      <strong>{review.learner.name}</strong>
                      <span>{review.learner.college}</span>
                    </div>
                    <span className="pill">{review.rating}/5</span>
                  </div>
                  <p>{review.comment}</p>
                </article>
              ))}
            </div>
          </article>
        </div>

        <aside className="panel stack">
          <div className="skill-card__trainer">
            <img src={skill.trainer.avatarUrl} alt={skill.trainer.name} />
            <div>
              <h3>{skill.trainer.name}</h3>
              <p>{skill.trainer.college}</p>
            </div>
          </div>
          <p>{skill.trainer.bio}</p>
          <div className="skill-card__stats">
            <span>{skill.trainer.trainerProfile.completedSessions} sessions</span>
            <span>{skill.trainer.trainerProfile.averageRating.toFixed(1)} rating</span>
          </div>
          <Link href={`/booking?skillId=${skill._id}`} className="button button--primary">
            Book this session
          </Link>
          <button type="button" className="button button--ghost" onClick={() => openWhatsAppChat(skill.trainer.phone)}>
            <MessageCircleMore size={16} />
            Chat on WhatsApp
          </button>
          <a
            className="button button--ghost"
            href={buildEmailLink(
              skill.trainer.email,
              `Skillzee session question: ${skill.title}`,
              "Hi, I booked your session on Skillzee and had a doubt."
            )}
          >
            Contact via Email
          </a>
        </aside>
      </div>
    </section>
  );
}
