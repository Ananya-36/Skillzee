"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock, Mail, Star } from "lucide-react";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { apiRequest } from "@/lib/api";
import { buildEmailLink, buildMeetingLink } from "@/lib/communication";
import { fallbackReviews, fallbackSkills } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import { getAvatarSrc, uniqueStrings } from "@/lib/presentation";
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

  const trainerWhatsApp = skill.trainer.whatsAppNumber || skill.trainer.phone;
  const visibleSessionTopics = uniqueStrings([...(skill.tags ?? []), ...(skill.outcomes ?? [])]);
  const visibleTrainerBadges = uniqueStrings(skill.trainer.badges ?? []);

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
              {visibleSessionTopics.map((tag, index) => (
                <span key={`${tag}-${index}`} className="pill">
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
                    <img src={getAvatarSrc(review.learner.name, review.learner.avatarUrl)} alt={review.learner.name} />
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
            <img src={getAvatarSrc(skill.trainer.name, skill.trainer.avatarUrl)} alt={skill.trainer.name} />
            <div>
              <div className="inline-name">
                <h3>{skill.trainer.name}</h3>
                <WhatsAppLink phone={trainerWhatsApp} skillTitle={skill.title} iconOnly />
              </div>
              <p>{skill.trainer.college}</p>
            </div>
          </div>
          <p>{skill.trainer.bio}</p>
          <div className="pill-row">
            {visibleTrainerBadges.map((badge, index) => (
              <span key={`${badge}-${index}`} className="pill">
                {badge}
              </span>
            ))}
          </div>
          <div className="skill-card__stats">
            <span>{skill.trainer.trainerProfile.completedSessions} sessions</span>
            <span>{skill.trainer.trainerProfile.averageRating.toFixed(1)} rating</span>
          </div>
          <Link href={`/booking?skillId=${skill._id}`} className="button button--primary">
            Book this session
          </Link>
          <WhatsAppLink phone={trainerWhatsApp} skillTitle={skill.title} label="Chat on WhatsApp" />
          <a
            className="button button--ghost"
            href={buildEmailLink(
              skill.trainer.email,
              `SkillSwap session question: ${skill.title}`,
              `Hi, I am interested in your ${skill.title} class on SkillSwap.`
            )}
            target="_blank"
            rel="noreferrer"
          >
            <Mail size={16} />
            Contact via Email
          </a>
          {skill.sessionType === "GOOGLE_MEET" ? (
            <a className="button button--ghost" href={buildMeetingLink(skill.meetLink)} target="_blank" rel="noreferrer">
              Preview Google Meet room
            </a>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
