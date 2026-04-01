import Link from "next/link";
import { Clock3, Heart, IndianRupee, MessageCircleMore, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { buildEmailLink, openWhatsAppChat } from "@/lib/communication";
import type { Skill } from "@/types";

type SkillCardProps = {
  skill: Skill;
  compact?: boolean;
};

export function SkillCard({ skill, compact = false }: SkillCardProps) {
  return (
    <article className={`skill-card ${compact ? "skill-card--compact" : ""}`}>
      <div className="skill-card__meta">
        <span className="pill">{skill.category}</span>
        <button type="button" className="icon-button" aria-label="Save skill">
          <Heart size={16} />
        </button>
      </div>

      <div>
        <h3>{skill.title}</h3>
        <p>{skill.description}</p>
      </div>

      <div className="skill-card__trainer">
        <img src={skill.trainer.avatarUrl} alt={skill.trainer.name} />
        <div>
          <strong>{skill.trainer.name}</strong>
          <span>{skill.trainer.college}</span>
        </div>
      </div>

      <div className="skill-card__stats">
        <span>
          <Star size={16} /> {skill.ratingAverage.toFixed(1)} ({skill.ratingCount})
        </span>
        <span>
          <Clock3 size={16} /> {skill.durationMinutes} min
        </span>
        <span>
          <IndianRupee size={16} /> {formatCurrency(skill.price)}
        </span>
      </div>

      <div className="skill-card__actions">
        <Link href={`/skills/${skill._id}`} className="button button--primary">
          View details
        </Link>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => openWhatsAppChat(skill.trainer.phone)}
        >
          <MessageCircleMore size={16} />
          WhatsApp
        </button>
        <a
          className="button button--ghost"
          href={buildEmailLink(
            skill.trainer.email,
            `Skillzee enquiry for ${skill.title}`,
            "Hi, I booked your session on Skillzee and had a doubt."
          )}
        >
          Email
        </a>
      </div>
    </article>
  );
}
