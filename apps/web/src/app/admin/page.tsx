"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/ui/metric-card";
import { SkillCard } from "@/components/ui/skill-card";
import { apiRequest } from "@/lib/api";
import { fallbackAdmin } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/format";
import type { AdminOverview } from "@/types";

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview>(fallbackAdmin);

  useEffect(() => {
    void apiRequest<AdminOverview>("/admin/overview")
      .then(setOverview)
      .catch(() => setOverview(fallbackAdmin));
  }, []);

  return (
    <section className="container page-header">
      <div className="page-header">
        <span className="eyebrow">Admin</span>
        <h1>Marketplace health at a glance.</h1>
        <p className="muted">
          Monitor user growth, booking velocity, revenue, and the skills driving platform momentum.
        </p>
      </div>
      <div className="cards-grid">
        <MetricCard label="Users" value={String(overview.users)} detail="Registered learner and trainer accounts." />
        <MetricCard label="Bookings" value={String(overview.bookings)} detail="Total completed and upcoming sessions." />
        <MetricCard label="Gross revenue" value={formatCurrency(overview.grossRevenue)} detail="Learner-side marketplace volume." />
      </div>
      <div className="section">
        <div className="panel">
          <h2>Platform revenue</h2>
          <p className="muted">{formatCurrency(overview.platformRevenue)} captured through the 20% commission model.</p>
        </div>
      </div>
      <div className="cards-grid">
        {overview.topSkills.map((skill) => (
          <SkillCard key={skill._id} skill={skill} />
        ))}
      </div>
    </section>
  );
}
