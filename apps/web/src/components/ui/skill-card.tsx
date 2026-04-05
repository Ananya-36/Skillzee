import Link from "next/link";
import { ArrowRight, Clock3, Heart, IndianRupee, Star } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { buildEmailLink } from "@/lib/communication";
import { getAvatarSrc, uniqueStrings } from "@/lib/presentation";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import type { Skill } from "@/types";

type SkillCardProps = {
  skill: Skill;
  compact?: boolean;
};

export function SkillCard({ skill, compact = false }: SkillCardProps) {
  const trainerWhatsApp = skill.trainer.whatsAppNumber || skill.trainer.phone;
  const visibleOutcomes = uniqueStrings(skill.outcomes ?? []).slice(0, compact ? 2 : 3);

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
        <img src={getAvatarSrc(skill.trainer.name, skill.trainer.avatarUrl)} alt={skill.trainer.name} />
        <div>
          <div className="inline-name">
            <strong>{skill.trainer.name}</strong>
            <WhatsAppLink phone={trainerWhatsApp} skillTitle={skill.title} iconOnly className="skill-card__whatsapp" />
          </div>
          <span>{skill.trainer.college}</span>
        </div>
      </div>

      {visibleOutcomes.length ? (
        <div className="pill-row">
          {visibleOutcomes.map((outcome, index) => (
            <span key={`${outcome}-${index}`} className="pill">
              {outcome}
            </span>
          ))}
        </div>
      ) : null}

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
          <ArrowRight size={16} />
        </Link>
        <Link href={`/booking?skillId=${skill._id}`} className="button button--ghost">
          Book now
        </Link>
        <a
          className="button button--ghost"
          href={buildEmailLink(
            skill.trainer.email,
            `SkillSwap enquiry for ${skill.title}`,
            `Hi, I am interested in your ${skill.title} class on SkillSwap.`
          )}
          target="_blank"
          rel="noreferrer"
        >
          Email
        </a>
      </div>
    </article>
  );
}
