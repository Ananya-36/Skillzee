"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Bot, BrainCircuit, ChartNoAxesCombined, Medal, ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionTitle } from "@/components/ui/section-title";
import { SkillCard } from "@/components/ui/skill-card";
import { apiRequest } from "@/lib/api";
import { fallbackSkills } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import type { Skill, User } from "@/types";

const fallbackLeaderboard: User[] = fallbackSkills.map((skill) => skill.trainer);

export default function HomePage() {
  const [trending, setTrending] = useState<Skill[]>(fallbackSkills);
  const [leaders, setLeaders] = useState<User[]>(fallbackLeaderboard);

  useEffect(() => {
    void apiRequest<Skill[]>("/skills/trending")
      .then(setTrending)
      .catch(() => setTrending(fallbackSkills));

    void apiRequest<User[]>("/skills/leaderboard")
      .then(setLeaders)
      .catch(() => setLeaders(fallbackLeaderboard));
  }, []);

  return (
    <>
      <section className="container hero">
        <div>
          <span className="eyebrow">Peer learning marketplace for students</span>
          <h1>Turn campus skills into trusted sessions, earnings, and momentum.</h1>
          <p>
            Skillzee helps students teach and learn from each other through affordable paid sessions,
            real-time chat, smart WhatsApp handoff, ratings, certificates, and a commission-first
            marketplace that feels like a real startup product.
          </p>
          <div className="hero__actions">
            <Link href="/explore" className="button button--primary">
              Explore skills
              <ArrowRight size={16} />
            </Link>
            <Link href="/auth" className="button button--ghost">
              Join as learner or trainer
            </Link>
          </div>
          <div className="cards-grid" style={{ marginTop: 28 }}>
            <MetricCard label="Platform commission" value="20%" detail="Transparent split on every booking." />
            <MetricCard label="Trainer payout on ₹300" value={formatCurrency(240)} detail="Skillzee keeps ₹60." />
            <MetricCard label="Communication" value="3 modes" detail="In-app chat, WhatsApp, and email fallback." />
          </div>
        </div>
        <div className="hero__visual">
          <article className="floating-card">
            <span className="eyebrow">Trending now</span>
            <h3>Design, analytics, speaking, and interview prep</h3>
            <p>Students book short, practical sessions that solve a real need in one sitting.</p>
            <div className="pill-row">
              <span className="pill">Figma</span>
              <span className="pill">Python</span>
              <span className="pill">Communication</span>
            </div>
          </article>
          <article className="floating-card">
            <h3>Live product signals</h3>
            <p>Realtime notifications, chat history, reminders, and trainer wallet updates.</p>
          </article>
          <article className="floating-card">
            <h3>Smart contact handoff</h3>
            <p>Open the WhatsApp app when available and fall back to WhatsApp Web automatically.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="Marketplace"
            title="Trending sessions students are already booking"
            description="Designed to feel modern, affordable, and outcome-focused instead of like a classifieds board."
          />
          <div className="cards-grid">
            {trending.map((skill) => (
              <SkillCard key={skill._id} skill={skill} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split-layout">
          <div className="panel">
            <SectionTitle
              eyebrow="Why it works"
              title="Built for the way students actually coordinate"
              description="Skillzee covers trust, booking, communication, and proof of value in one flow."
            />
            <div className="stack">
              {[
                {
                  icon: <ShieldCheck size={18} />,
                  title: "Verified learner-to-trainer flow",
                  copy: "Bookings connect real students through profiles, reviews, and confirmed sessions."
                },
                {
                  icon: <BadgeIndianRupee size={18} />,
                  title: "Commission-ready monetization",
                  copy: "Platform earnings, trainer payouts, and wallet tracking are built into each booking."
                },
                {
                  icon: <Bot size={18} />,
                  title: "AI-style recommendations",
                  copy: "Learners discover sessions based on interests, saved skills, and booking behavior."
                }
              ].map((item) => (
                <article key={item.title} className="glass-card">
                  <div className="pill">{item.icon}{item.title}</div>
                  <p>{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="panel">
            <SectionTitle
              eyebrow="Advanced features"
              title="Not just listings, but a real growth system"
              description="The platform includes discovery loops that make the product feel alive."
            />
            <div className="stack">
              <article className="timeline-card">
                <div className="pill">
                  <BrainCircuit size={16} />
                  AI recommendations
                </div>
                <p>Skills are ranked using interests, previous bookings, favorites, quality, and affordability.</p>
              </article>
              <article className="timeline-card">
                <div className="pill">
                  <Medal size={16} />
                  Leaderboards and badges
                </div>
                <p>Top trainers rise through ratings, completed sessions, and gamified points.</p>
              </article>
              <article className="timeline-card">
                <div className="pill">
                  <ChartNoAxesCombined size={16} />
                  Startup-style admin overview
                </div>
                <p>Revenue, top skills, total bookings, and marketplace health stay visible from day one.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="Top trainers"
            title="Students building real credibility on campus"
            description="Leaderboards reward reliable trainers and help learners discover trusted mentors faster."
          />
          <div className="cards-grid">
            {leaders.slice(0, 3).map((trainer) => (
              <article key={trainer._id} className="panel">
                <div className="skill-card__trainer">
                  <img src={trainer.avatarUrl} alt={trainer.name} />
                  <div>
                    <h3>{trainer.name}</h3>
                    <p>{trainer.college}</p>
                  </div>
                </div>
                <p>{trainer.bio}</p>
                <div className="pill-row">
                  {trainer.badges.slice(0, 3).map((badge) => (
                    <span key={badge} className="pill">
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="skill-card__stats">
                  <span>{trainer.trainerProfile.averageRating.toFixed(1)} avg rating</span>
                  <span>{trainer.trainerProfile.completedSessions} sessions</span>
                  <span>{trainer.points} points</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
