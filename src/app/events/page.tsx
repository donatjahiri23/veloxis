"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { generateLiveEvent, LiveEvent } from "@/lib/mock-data";

const typeConfig: Record<string, { color: string; bg: string; icon: string }> = {
  pageview: { color: "text-blue-400", bg: "bg-blue-400/10", icon: "eye" },
  click: { color: "text-indigo-400", bg: "bg-indigo-400/10", icon: "cursor" },
  conversion: { color: "text-emerald-400", bg: "bg-emerald-400/10", icon: "check" },
  impression: { color: "text-slate-400", bg: "bg-slate-400/10", icon: "image" },
  video_view: { color: "text-purple-400", bg: "bg-purple-400/10", icon: "play" },
  scroll: { color: "text-cyan-400", bg: "bg-cyan-400/10", icon: "arrows" },
  form_submit: { color: "text-amber-400", bg: "bg-amber-400/10", icon: "form" },
};

function EventRow({ event, isNew }: { event: LiveEvent; isNew: boolean }) {
  const config = typeConfig[event.type] || typeConfig.pageview;

  return (
    <div className={`flex items-center gap-4 px-4 py-2.5 border-b border-card-border/50 hover:bg-hover-bg transition-all ${isNew ? "animate-slide-up" : ""}`}>
      <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <span className={`text-[10px] font-bold ${config.color}`}>
          {event.type.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0 grid grid-cols-7 gap-3 items-center text-xs">
        <span className={`font-medium ${config.color}`}>{event.type}</span>
        <span className="text-text-primary font-mono truncate">{event.page_url}</span>
        <span className="text-muted-light">{event.channel}</span>
        <span className="text-muted-light">{event.device}</span>
        <span className="text-muted font-mono text-[10px]">{event.resolved_id || event.anonymous_id}</span>
        <span className="text-muted">{event.city}, {event.country}</span>
        <div className="text-right">
          {event.value ? (
            <span className="text-success font-mono font-semibold">${event.value}</span>
          ) : (
            <span className="text-muted font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [stats, setStats] = useState({ total: 0, conversions: 0, revenue: 0, eps: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const eventCountRef = useRef(0);

  useEffect(() => {
    const initial = Array.from({ length: 30 }, () => generateLiveEvent());
    setEvents(initial);
    eventCountRef.current = 30;
  }, []);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      const batch = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => generateLiveEvent());
      eventCountRef.current += batch.length;
      setEvents(prev => [...batch, ...prev].slice(0, 200));
      setStats(prev => ({
        total: prev.total + batch.length,
        conversions: prev.conversions + batch.filter(e => e.type === "conversion").length,
        revenue: prev.revenue + batch.reduce((s, e) => s + (e.value || 0), 0),
        eps: Math.round(eventCountRef.current / ((Date.now() % 60000) / 1000 + 1)),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, [paused]);

  const filtered = typeFilter === "all" ? events : events.filter(e => e.type === typeFilter);
  const types = ["all", "pageview", "click", "conversion", "impression", "video_view", "scroll", "form_submit"];

  return (
    <div className="p-4 lg:p-8 h-screen flex flex-col">
      <PageHeader
        title="Live Events"
        subtitle="Real-time event stream from your tracking pixel"
        actions={
          <button
            onClick={() => setPaused(!paused)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              paused
                ? "bg-success/15 text-success border border-success/30 hover:bg-success/25"
                : "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25"
            }`}
          >
            {paused ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            )}
            {paused ? "Resume" : "Pause"}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <MetricCard label="Events Captured" value={stats.total} />
        <MetricCard label="Conversions" value={stats.conversions} />
        <MetricCard label="Revenue Captured" value={stats.revenue} prefix="$" />
        <MetricCard label="Events/sec" value={Math.max(stats.eps, 1)} />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {types.map((t) => {
          const count = t === "all" ? events.length : events.filter(e => e.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === t
                  ? "bg-accent/15 text-accent-light border border-accent/30"
                  : "bg-card-bg text-muted-light border border-card-border hover:border-accent/20"
              }`}
            >
              {t === "all" ? "All" : t.replace("_", " ")}
              <span className="text-[10px] text-muted font-mono">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 bg-card-bg border border-card-border rounded-xl overflow-hidden flex flex-col min-h-0">
        <div className="grid grid-cols-7 gap-3 px-4 py-2 border-b border-card-border text-[10px] font-medium text-muted uppercase tracking-wider">
          <span>Type</span>
          <span>Page</span>
          <span>Channel</span>
          <span>Device</span>
          <span>Identity</span>
          <span>Location</span>
          <span className="text-right">Value / Time</span>
        </div>
        <div ref={containerRef} className="flex-1 overflow-y-auto">
          {filtered.map((event, i) => (
            <EventRow key={event.id} event={event} isNew={i < 3} />
          ))}
        </div>
      </div>
    </div>
  );
}
