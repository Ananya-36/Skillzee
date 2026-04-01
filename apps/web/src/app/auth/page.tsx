"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const interestOptions = ["Design", "Analytics", "Communication", "Coding", "Marketing"];

export default function AuthPage() {
  const router = useRouter();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setMessage("");

    try {
      await login(String(formData.get("email")), String(formData.get("password")));
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(formData: FormData) {
    setLoading(true);
    setMessage("");

    const interests = formData
      .getAll("interests")
      .map((item) => String(item))
      .filter(Boolean);

    try {
      await register({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        phone: String(formData.get("phone")),
        college: String(formData.get("college")),
        password: String(formData.get("password")),
        bio: String(formData.get("bio")),
        avatarUrl: String(formData.get("avatarUrl")),
        rolePreference: String(formData.get("rolePreference") || "BOTH"),
        interests
      });
      router.push("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container page-header">
      <div className="split-layout">
        <div className="panel">
          <span className="eyebrow">Start using Skillzee</span>
          <h1>Join as a learner, trainer, or both.</h1>
          <p>
            Profiles are designed for real booking flows, including WhatsApp-ready phone numbers, bios,
            profile photos, interests, and a role preference that matches how students use the platform.
          </p>
          <div className="stack">
            <article className="timeline-card">
              <h3>JWT-based auth</h3>
              <p>Fast session handling for the frontend and Express API.</p>
            </article>
            <article className="timeline-card">
              <h3>Communication-first profile</h3>
              <p>Phone number powers WhatsApp handoff and email stays available as a fallback.</p>
            </article>
            <article className="timeline-card">
              <h3>Career-ready presence</h3>
              <p>Bio, college, badges, ratings, and reviews help build trust quickly.</p>
            </article>
          </div>
        </div>

        <div className="form-panel">
          <div className="panel-actions">
            <button
              type="button"
              className={`button ${mode === "register" ? "button--primary" : "button--ghost"}`}
              onClick={() => setMode("register")}
            >
              Create account
            </button>
            <button
              type="button"
              className={`button ${mode === "login" ? "button--primary" : "button--ghost"}`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
          </div>

          {mode === "login" ? (
            <form
              className="form-grid"
              action={(formData) => {
                void handleLogin(formData);
              }}
            >
              <label>
                Email
                <input name="email" type="email" defaultValue="riya@skillzee.app" required />
              </label>
              <label>
                Password
                <input name="password" type="password" defaultValue="Skillzee123" required />
              </label>
              <button className="button button--primary" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          ) : (
            <form
              className="form-grid"
              action={(formData) => {
                void handleRegister(formData);
              }}
            >
              <div className="form-grid form-grid--two">
                <label>
                  Full name
                  <input name="name" required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" required />
                </label>
              </div>
              <div className="form-grid form-grid--two">
                <label>
                  Phone number
                  <input name="phone" placeholder="919876543210" required />
                </label>
                <label>
                  College
                  <input name="college" required />
                </label>
              </div>
              <div className="form-grid form-grid--two">
                <label>
                  Role
                  <select name="rolePreference" defaultValue="BOTH">
                    <option value="LEARNER">Learner</option>
                    <option value="TRAINER">Trainer</option>
                    <option value="BOTH">Both</option>
                  </select>
                </label>
                <label>
                  Password
                  <input name="password" type="password" required />
                </label>
              </div>
              <label>
                Profile photo URL
                <input name="avatarUrl" type="url" placeholder="https://..." />
              </label>
              <label>
                Bio
                <textarea name="bio" placeholder="Tell learners and trainers what you can teach or want to learn." />
              </label>
              <label>
                Interests
                <select name="interests" multiple size={interestOptions.length}>
                  {interestOptions.map((interest) => (
                    <option key={interest} value={interest}>
                      {interest}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button button--primary" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          {message ? <p className="muted">{message}</p> : null}
        </div>
      </div>
    </section>
  );
}
