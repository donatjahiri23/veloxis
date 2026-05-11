"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { generateUserJourneys, UserJourney } from "@/lib/mock-data";

const deviceColors: Record<string, string> = {
  Desktop: "#6366f1",
  Mobile: "#10b981",
  Tablet: "#f59e0b",
};

const typeColors: Record<string, string> = {
  click: "#6366f1",
  impression: "#94a3b8",
  view: "#818cf8",
  visit: "#10b981",
  conversion: "#f59e0b",
};

function JourneyTimeline({ journey }: { journey: UserJourney }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-card-bg border rounded-xl p-5 transition-all duration-300 cursor-pointer ${
        expanded ? "border-accent/40 ring-1 ring-accent/10" : "border-card-border hover:border-accent/20"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-mono text-white">{journey.resolved_id}</p>
            <p className="text-xs text-muted">{journey.touchpoints.length} touchpoints across {journey.devices.length} device{journey.devices.length > 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {journey.devices.map(d => (
            <span key={d} className="text-[10px] px-2 py-0.5 rounded-full font-medium border" style={{ color: deviceColors[d], borderColor: deviceColors[d] + "40", backgroundColor: deviceColors[d] + "15" }}>
              {d}
            </span>
          ))}
          {journey.converted ? (
            <span className="text-[10px] bg-success/15 text-success px-2 py-0.5 rounded-full font-semibold border border-success/20">
              Converted — ${journey.conversion_value}
            </span>
          ) : (
            <span className="text-[10px] bg-white/5 text-muted px-2 py-0.5 rounded-full font-medium border border-card-border">
              In Journey
            </span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-4 ml-4 border-l-2 border-card-border space-y-0">
          {journey.touchpoints.map((tp, i) => (
            <div key={tp.id} className="relative pl-6 py-2 group">
              <div
                className="absolute left-[-5px] top-3 w-2.5 h-2.5 rounded-full border-2 border-background"
                style={{ backgroundColor: typeColors[tp.type] || "#64748b" }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white">{tp.channel}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted font-mono">{tp.type}</span>
                    <span className="text-[10px] text-muted" style={{ color: deviceColors[tp.device] }}>{tp.device}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted">{tp.campaign}</span>
                    {tp.page_url && <span className="text-[10px] text-muted font-mono">{tp.page_url}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted font-mono">{new Date(tp.timestamp).toLocaleString()}</p>
                  <p className="text-[10px] text-muted font-mono">{tp.anonymous_id}</p>
                  {tp.value && <p className="text-xs text-success font-semibold">${tp.value}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function IdentityPage() {
  const [journeys, setJourneys] = useState<UserJourney[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | "converted" | "multi-device">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setJourneys(generateUserJourneys(40));
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8"><div className="animate-pulse text-muted">Loading identity graph...</div></div>;

  const filtered = journeys.filter(j => {
    if (filter === "converted" && !j.converted) return false;
    if (filter === "multi-device" && j.devices.length < 2) return false;
    if (search && !j.resolved_id.includes(search) && !j.touchpoints.some(tp => tp.channel.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const stats = {
    total: journeys.length,
    resolved: journeys.filter(j => j.touchpoints.length > 1).length,
    crossDevice: journeys.filter(j => j.devices.length > 1).length,
    converted: journeys.filter(j => j.converted).length,
    avgTouchpoints: (journeys.reduce((s, j) => s + j.touchpoints.length, 0) / journeys.length).toFixed(1),
  };

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Identity Resolution"
        subtitle="Anonymous touchpoints stitched into unified user journeys — no PII required"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <MetricCard label="Total Identities" value={stats.total} />
        <MetricCard label="Resolved Journeys" value={stats.resolved} />
        <MetricCard label="Cross-Device Users" value={stats.crossDevice} />
        <MetricCard label="Converted Users" value={stats.converted} />
        <MetricCard label="Avg. Touchpoints" value={stats.avgTouchpoints} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="flex items-center bg-card-bg border border-card-border rounded-lg overflow-hidden">
          {(["all", "converted", "multi-device"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                filter === f ? "bg-accent text-white" : "text-muted-light hover:text-white"
              }`}
            >
              {f === "all" ? "All Journeys" : f === "converted" ? "Converted" : "Cross-Device"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by ID or channel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card-bg border border-card-border rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50"
          />
        </div>
        <span className="text-xs text-muted">{filtered.length} journeys</span>
      </div>

      <div className="space-y-3">
        {filtered.slice(0, 20).map((journey) => (
          <JourneyTimeline key={journey.resolved_id} journey={journey} />
        ))}
      </div>
    </div>
  );
}
