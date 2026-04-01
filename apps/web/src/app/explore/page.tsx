"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SkillCard } from "@/components/ui/skill-card";
import { apiRequest } from "@/lib/api";
import { fallbackSkills } from "@/lib/mock-data";
import type { Skill } from "@/types";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");
  const [skills, setSkills] = useState<Skill[]>(fallbackSkills);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (mode) params.set("mode", mode);

    void apiRequest<Skill[]>(`/skills?${params.toString()}`)
      .then((data) => setSkills(data.length ? data : fallbackSkills))
      .catch(() => setSkills(fallbackSkills));
  }, [category, mode, query]);

  return (
    <section className="container page-header">
      <div className="page-header">
        <span className="eyebrow">Explore</span>
        <h1>Browse affordable sessions from student trainers.</h1>
        <p className="muted">
          Search by problem, category, or delivery mode and move straight into booking, chat, or contact.
        </p>
      </div>
      <div className="panel">
        <div className="form-grid form-grid--two">
          <label>
            Search skills
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", top: 16, left: 14, color: "#95a4c8" }} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Figma, Python, public speaking..."
                style={{ paddingLeft: 40 }}
              />
            </div>
          </label>
          <div className="form-grid form-grid--two">
            <label>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All categories</option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Communication">Communication</option>
              </select>
            </label>
            <label>
              Mode
              <select value={mode} onChange={(event) => setMode(event.target.value)}>
                <option value="">Any mode</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="cards-grid section">
        {skills.map((skill) => (
          <SkillCard key={skill._id} skill={skill} />
        ))}
      </div>
    </section>
  );
}
