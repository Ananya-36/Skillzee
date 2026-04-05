"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { SkillCard } from "@/components/ui/skill-card";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { apiRequest } from "@/lib/api";
import { buildEmailLink } from "@/lib/communication";
import { fallbackSkills, fallbackUser } from "@/lib/mock-data";
import { getAvatarSrc, uniqueStrings } from "@/lib/presentation";
import { useAuth } from "@/hooks/use-auth";
import type { Skill, User } from "@/types";

export default function ProfilePage() {
  const { token, user, setUser } = useAuth();
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<User>(user ?? fallbackUser);
  const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>(fallbackSkills);

  useEffect(() => {
    setProfile(user ?? fallbackUser);
  }, [user]);

  useEffect(() => {
    if (!token) {
      setSuggestedSkills(fallbackSkills);
      return;
    }

    void apiRequest<Skill[]>("/skills/recommended", { token })
      .then((data) => setSuggestedSkills(data.length ? data : fallbackSkills))
      .catch(() => setSuggestedSkills(fallbackSkills));
  }, [token]);

  async function handleSave(formData: FormData) {
    if (!token) {
      setMessage("Sign in to save profile changes.");
      return;
    }

    try {
      const updatedUser = await apiRequest<User>("/auth/profile", {
        method: "PATCH",
        token,
        body: JSON.stringify({
          name: formData.get("name"),
          phone: formData.get("phone"),
          whatsAppNumber: formData.get("whatsAppNumber"),
          college: formData.get("college"),
          bio: formData.get("bio"),
          avatarUrl: formData.get("avatarUrl"),
          rolePreference: formData.get("rolePreference"),
          interests: String(formData.get("interests"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          skills: String(formData.get("skills"))
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        })
      });

      setUser(updatedUser);
      setProfile(updatedUser);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update profile");
    }
  }

  const trainerWhatsApp = profile.whatsAppNumber || profile.phone;

  return (
    <section className="container page-header">
      <div className="profile-grid">
        <article className="panel stack">
          <div className="skill-card__trainer">
            <img src={getAvatarSrc(profile.name, profile.avatarUrl)} alt={profile.name} className="avatar" />
            <div>
              <div className="inline-name">
                <h1>{profile.name}</h1>
                <WhatsAppLink phone={trainerWhatsApp} skillTitle="SkillSwap profile" iconOnly />
              </div>
              <p>{profile.college}</p>
            </div>
          </div>
          <p>{profile.bio}</p>
          <div className="pill-row">
            {uniqueStrings(profile.badges).map((badge, index) => (
              <span key={`${badge}-${index}`} className="pill">
                {badge}
              </span>
            ))}
          </div>
          <div className="skill-card__stats">
            <span>{profile.points} points</span>
            <span>{profile.rolePreference}</span>
            <span>{profile.trainerProfile.completedSessions} sessions</span>
            <span>{profile.trainerProfile.averageRating.toFixed(1)} avg rating</span>
          </div>
          <div className="cards-grid">
            <article className="timeline-card">
              <h3>Learner mode</h3>
              <p>Use this same profile to discover classes, save interests, review sessions, and download certificates.</p>
            </article>
            <article className="timeline-card">
              <h3>Provider mode</h3>
              <p>Showcase your skills, badges, WhatsApp contact, session history, and future payout credibility.</p>
            </article>
          </div>
          <div className="stack">
            <div>
              <strong>Skills</strong>
              <div className="pill-row" style={{ marginTop: 12 }}>
                {uniqueStrings(profile.skills ?? []).map((skill, index) => (
                  <span key={`${skill}-${index}`} className="pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong>Interests</strong>
              <div className="pill-row" style={{ marginTop: 12 }}>
                {uniqueStrings(profile.interests ?? []).map((interest, index) => (
                  <span key={`${interest}-${index}`} className="pill">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="panel-actions">
            <WhatsAppLink phone={trainerWhatsApp} skillTitle="SkillSwap profile" label="WhatsApp" />
            <a
              className="button button--ghost"
              href={buildEmailLink(profile.email, "SkillSwap profile enquiry", `Hi ${profile.name}, I found your profile on SkillSwap.`)}
              target="_blank"
              rel="noreferrer"
            >
              <Mail size={16} />
              Email
            </a>
          </div>
          <form
            className="form-grid"
            action={(formData) => {
              void handleSave(formData);
            }}
          >
            <div className="form-grid form-grid--two">
              <label>
                Name
                <input name="name" defaultValue={profile.name} />
              </label>
              <label>
                Phone
                <input name="phone" defaultValue={profile.phone} />
              </label>
            </div>
            <div className="form-grid form-grid--two">
              <label>
                WhatsApp number
                <input name="whatsAppNumber" defaultValue={profile.whatsAppNumber} />
              </label>
              <label>
                Role preference
                <select name="rolePreference" defaultValue={profile.rolePreference}>
                  <option value="LEARNER">Learner</option>
                  <option value="TRAINER">Provider</option>
                  <option value="BOTH">Both</option>
                </select>
              </label>
            </div>
            <div className="form-grid form-grid--two">
              <label>
                College
                <input name="college" defaultValue={profile.college} />
              </label>
              <label>
                Avatar URL
                <input name="avatarUrl" defaultValue={profile.avatarUrl} />
              </label>
            </div>
            <label>
              Bio
              <textarea name="bio" defaultValue={profile.bio} />
            </label>
            <div className="form-grid form-grid--two">
              <label>
                Interests
                <input name="interests" defaultValue={profile.interests.join(", ")} />
              </label>
              <label>
                Skills
                <input name="skills" defaultValue={(profile.skills ?? []).join(", ")} />
              </label>
            </div>
            <button className="button button--primary" type="submit">
              Save profile
            </button>
          </form>
          {message ? <p className="muted">{message}</p> : null}
        </article>

        <article className="panel stack">
          <h2>Suggested classes for your current interests</h2>
          <p className="muted">This area doubles as your learner view even if you also teach on the platform.</p>
          {suggestedSkills.slice(0, 3).map((skill) => (
            <SkillCard key={skill._id} skill={skill} compact />
          ))}
        </article>
      </div>
    </section>
  );
}
