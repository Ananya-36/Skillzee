"use client";

import { useEffect, useState } from "react";
import { SkillCard } from "@/components/ui/skill-card";
import { apiRequest } from "@/lib/api";
import { fallbackSkills, fallbackUser } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/types";

export default function ProfilePage() {
  const { token, user, setUser } = useAuth();
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<User>(user ?? fallbackUser);

  useEffect(() => {
    setProfile(user ?? fallbackUser);
  }, [user]);

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
          college: formData.get("college"),
          bio: formData.get("bio"),
          avatarUrl: formData.get("avatarUrl")
        })
      });

      setUser(updatedUser);
      setProfile(updatedUser);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update profile");
    }
  }

  return (
    <section className="container page-header">
      <div className="profile-grid">
        <article className="panel stack">
          <div className="skill-card__trainer">
            <img src={profile.avatarUrl} alt={profile.name} className="avatar" />
            <div>
              <h1>{profile.name}</h1>
              <p>{profile.college}</p>
            </div>
          </div>
          <p>{profile.bio}</p>
          <div className="pill-row">
            {profile.badges.map((badge) => (
              <span key={badge} className="pill">
                {badge}
              </span>
            ))}
          </div>
          <div className="skill-card__stats">
            <span>{profile.points} points</span>
            <span>{profile.rolePreference}</span>
            <span>{profile.trainerProfile.completedSessions} sessions</span>
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
            <button className="button button--primary" type="submit">
              Save profile
            </button>
          </form>
          {message ? <p className="muted">{message}</p> : null}
        </article>

        <article className="panel stack">
          <h2>Saved and suggested skills</h2>
          <p className="muted">Your profile is ready for both learner and trainer journeys.</p>
          {fallbackSkills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} compact />
          ))}
        </article>
      </div>
    </section>
  );
}
