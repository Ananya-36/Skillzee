"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SkillCard } from "@/components/ui/skill-card";
import { apiRequest } from "@/lib/api";
import { fallbackSkills } from "@/lib/mock-data";
import type { Skill } from "@/types";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("trending");
  const [skills, setSkills] = useState<Skill[]>(fallbackSkills);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const hasActiveFilters = useMemo(
    () => Boolean(deferredQuery || category || mode || maxPrice || sort !== "trending"),
    [category, deferredQuery, maxPrice, mode, sort]
  );

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();

    if (deferredQuery) params.set("q", deferredQuery);
    if (category) params.set("category", category);
    if (mode) params.set("mode", mode);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);

    setIsLoading(true);
    setFetchError("");

    void apiRequest<Skill[]>(`/skills?${params.toString()}`)
      .then((data) => {
        if (ignore) {
          return;
        }

        setSkills(data);
        setHasLoaded(true);
      })
      .catch(() => {
        if (ignore) {
          return;
        }

        setFetchError("Search could not refresh right now.");
        setSkills(hasActiveFilters ? [] : fallbackSkills);
        setHasLoaded(true);
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [category, deferredQuery, hasActiveFilters, maxPrice, mode, sort]);

  function resetFilters() {
    setQuery("");
    setCategory("");
    setMode("");
    setMaxPrice("");
    setSort("trending");
  }

  return (
    <section className="container page-header">
      <div className="page-header">
        <span className="eyebrow">Explore</span>
        <h1>Browse student-led classes with ratings, WhatsApp contact, and fast booking.</h1>
        <p className="muted">
          Search by goal, category, budget, or delivery mode and move straight into booking, chat, or contact.
        </p>
      </div>
      <div className="panel">
        <div className="form-grid">
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
          <div className="form-grid form-grid--four">
            <label>
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="">All categories</option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Communication">Communication</option>
                <option value="Creative">Creative</option>
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
            <label>
              Max price
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="499"
              />
            </label>
            <label>
              Sort by
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="trending">Trending</option>
                <option value="rating">Top rated</option>
                <option value="price_asc">Lowest price</option>
                <option value="latest">Newest</option>
              </select>
            </label>
          </div>
          <div className="panel-actions" style={{ justifyContent: "space-between" }}>
            <p className="muted" style={{ margin: 0 }}>
              {isLoading
                ? "Searching classes..."
                : `${skills.length} session${skills.length === 1 ? "" : "s"} ${hasActiveFilters ? "match your filters" : "available now"}.`}
            </p>
            {hasActiveFilters ? (
              <button type="button" className="button button--ghost button--sm" onClick={resetFilters}>
                Clear filters
              </button>
            ) : null}
          </div>
          {fetchError ? <p className="muted">{fetchError}</p> : null}
        </div>
      </div>

      {hasLoaded && !isLoading && skills.length === 0 ? (
        <div className="panel empty-state section">
          <h2>No classes match these filters yet.</h2>
          <p>Try a broader search, raise the budget, or clear filters to see all available sessions.</p>
        </div>
      ) : (
        <div className="cards-grid section">
          {skills.map((skill) => (
            <SkillCard key={skill._id} skill={skill} />
          ))}
        </div>
      )}
    </section>
  );
}
