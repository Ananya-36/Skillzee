"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

const interestOptions = [
  "Design",
  "Analytics",
  "Communication",
  "Coding",
  "Marketing",
  "Video Editing",
  "UI/UX",
  "Data Science",
  "Public Speaking",
  "Content Creation",
  "Branding",
  "Web Development",
  "Python",
  "Finance",
  "Excel",
  "Product Management",
  "Interview Prep",
  "Motion Design"
];

export default function AuthPage() {
  return (
    <Suspense fallback={<section className="container page-header"><div className="panel">Loading sign in...</div></section>}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const requestedMode = searchParams.get("mode") === "login" ? "login" : "register";
  const [mode, setMode] = useState<"login" | "register">(requestedMode);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Design", "Analytics"]);

  useEffect(() => {
    setMode(requestedMode);
  }, [requestedMode]);

  function formatAuthError(error: unknown, fallbackMessage: string) {
    if (error instanceof ApiError) {
      const fieldErrors = (error.details?.issues as { fieldErrors?: Record<string, string[]> } | undefined)?.fieldErrors;
      const firstFieldError = fieldErrors
        ? Object.values(fieldErrors)
            .flat()
            .find(Boolean)
        : null;

      return firstFieldError || error.message || fallbackMessage;
    }

    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      return "The site could not reach the SkillSwap API. Refresh the page and try again.";
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallbackMessage;
  }

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setMessage("");

    try {
      await login(String(formData.get("email")), String(formData.get("password")));
      router.push("/dashboard");
    } catch (error) {
      setMessage(formatAuthError(error, "Login failed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(formData: FormData) {
    setLoading(true);
    setMessage("");
    const skills = String(formData.get("skills") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      await register({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        phone: String(formData.get("phone")),
        whatsAppNumber: String(formData.get("whatsAppNumber") || formData.get("phone")),
        college: String(formData.get("college")),
        password: String(formData.get("password")),
        bio: String(formData.get("bio")),
        avatarUrl: String(formData.get("avatarUrl")),
        rolePreference: String(formData.get("rolePreference") || "BOTH"),
        interests: selectedInterests,
        skills
      });
      router.push("/dashboard");
    } catch (error) {
      setMessage(formatAuthError(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode: "login" | "register") {
    setMode(nextMode);
    router.replace(`/auth?mode=${nextMode}`);
  }

  function toggleInterest(interest: string) {
    setSelectedInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest]
    );
  }

  return (
    <section className="container page-header">
      <div className="split-layout">
        <div className="panel">
          <span className="eyebrow">Start using SkillSwap</span>
          <h1>Join once and switch between Learner and Provider dashboards.</h1>
          <p>
            Your account stores the exact fields the marketplace needs: name, email, WhatsApp number,
            bio, interests, skills, and a role preference that can power both sides of the platform.
          </p>
          <div className="stack">
            <article className="timeline-card">
              <h3>Dual-profile logic</h3>
              <p>One account can learn, teach, book, rate, earn, and chat without creating a second profile.</p>
            </article>
            <article className="timeline-card">
              <h3>WhatsApp-ready from day one</h3>
              <p>Your WhatsApp number is saved separately so every class card can open a direct conversation instantly.</p>
            </article>
            <article className="timeline-card">
              <h3>Presentation-friendly data</h3>
              <p>Profiles show badges, ratings, skills, session history, and wallet metrics like a real marketplace.</p>
            </article>
          </div>
        </div>

        <div className="form-panel">
          <div className="panel-actions">
            <button
              type="button"
              className={`button ${mode === "register" ? "button--primary" : "button--ghost"}`}
              onClick={() => switchMode("register")}
            >
              Create account
            </button>
            <button
              type="button"
              className={`button ${mode === "login" ? "button--primary" : "button--ghost"}`}
              onClick={() => switchMode("login")}
            >
              Sign in
            </button>
          </div>

          {searchParams.get("switch") === "1" && mode === "login" ? (
            <p className="muted">You were signed out so you can log into a different account.</p>
          ) : null}

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
                  WhatsApp number
                  <input name="whatsAppNumber" placeholder="919876543210" required />
                </label>
              </div>
              <div className="form-grid form-grid--two">
                <label>
                  College
                  <input name="college" required />
                </label>
                <label>
                  Role
                  <select name="rolePreference" defaultValue="BOTH">
                    <option value="LEARNER">Learner</option>
                    <option value="TRAINER">Provider</option>
                    <option value="BOTH">Both</option>
                  </select>
                </label>
              </div>
              <div className="form-grid form-grid--two">
                <label>
                  Password
                  <input name="password" type="password" required />
                </label>
                <label>
                  Profile photo URL
                  <input name="avatarUrl" type="url" placeholder="https://..." />
                </label>
              </div>
              <label>
                Bio
                <textarea name="bio" placeholder="Tell learners and providers what you can teach or want to learn." />
              </label>
              <label>
                Skills
                <input name="skills" placeholder="Figma, Canva, Video Editing, Excel" />
              </label>
              <div className="form-grid">
                <label>Interests</label>
                <p className="muted" style={{ margin: 0 }}>
                  Choose one or more areas so learner recommendations can match your interests and paid classes.
                </p>
                <div className="interest-picker">
                  {interestOptions.map((interest) => {
                    const selected = selectedInterests.includes(interest);

                    return (
                      <button
                        key={interest}
                        type="button"
                        className={`interest-chip ${selected ? "interest-chip--active" : ""}`}
                        onClick={() => toggleInterest(interest)}
                        aria-pressed={selected}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
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
