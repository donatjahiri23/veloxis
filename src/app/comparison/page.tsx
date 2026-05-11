"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { PageHeader } from "@/components/PageHeader";

interface PeriodData {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  cpa: number;
  cpl: number;
  sessions: number;
  bounce_rate: number;
  avg_duration: number;
  new_users: number;
  returning_users: number;
  channels: { name: string; spend: number; revenue: number; conversions: number; roas: number; cpa: number }[];
  daily: { date: string; conversions: number; revenue: number; spend: number }[];
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePeriod(startDate: Date, days: number, multiplier: number = 1): PeriodData {
  const channels = ["Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads", "Email", "Organic Search", "Display", "YouTube"];
  let totalImpressions = 0, totalClicks = 0, totalConversions = 0, totalSpend = 0, totalRevenue = 0;
  const daily: PeriodData["daily"] = [];
  const channelData: PeriodData["channels"] = [];

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate.getTime() + d * 86400000).toISOString().split("T")[0];
    const conv = Math.round(rand(30, 100) * multiplier);
    const rev = Math.round(conv * rand(60, 300));
    const sp = Math.round(rand(1500, 4000) * multiplier);
    daily.push({ date, conversions: conv, revenue: rev, spend: sp });
    totalConversions += conv;
    totalRevenue += rev;
    totalSpend += sp;
  }

  totalImpressions = Math.round(rand(1200000, 2500000) * multiplier);
  totalClicks = Math.round(totalImpressions * (Math.random() * 0.03 + 0.015));

  channels.forEach(name => {
    const sp = Math.round(totalSpend * (Math.random() * 0.2 + 0.05));
    const conv = Math.round(totalConversions * (Math.random() * 0.2 + 0.05));
    const rev = Math.round(conv * rand(60, 350));
    channelData.push({
      name,
      spend: sp,
      revenue: rev,
      conversions: conv,
      roas: +(rev / Math.max(sp, 1)).toFixed(2),
      cpa: conv > 0 ? +(sp / conv).toFixed(2) : 0,
    });
  });

  const sessions = Math.round(totalClicks * 1.3);
  return {
    impressions: totalImpressions,
    clicks: totalClicks,
    ctr: +((totalClicks / totalImpressions) * 100).toFixed(2),
    conversions: totalConversions,
    spend: totalSpend,
    revenue: totalRevenue,
    roas: +(totalRevenue / totalSpend).toFixed(2),
    cpa: +(totalSpend / totalConversions).toFixed(2),
    cpl: +(totalSpend / Math.round(totalConversions * 2.5)).toFixed(2),
    sessions,
    bounce_rate: +(Math.random() * 15 + 28).toFixed(1),
    avg_duration: rand(140, 380),
    new_users: Math.round(sessions * (Math.random() * 0.3 + 0.5)),
    returning_users: Math.round(sessions * (Math.random() * 0.2 + 0.2)),
    channels: channelData.sort((a, b) => b.revenue - a.revenue),
    daily,
  };
}

const presets = [
  { label: "This week vs Last week", a: 7, b: 7, offset: 7 },
  { label: "This month vs Last month", a: 30, b: 30, offset: 30 },
  { label: "Last 7d vs Previous 7d", a: 7, b: 7, offset: 7 },
  { label: "Last 30d vs Previous 30d", a: 30, b: 30, offset: 30 },
  { label: "Last 90d vs Previous 90d", a: 90, b: 90, offset: 90 },
];

function ChangeIndicator({ current, previous, format = "number", inverse = false }: { current: number; previous: number; format?: "number" | "currency" | "percent" | "time" | "multiplier"; inverse?: boolean }) {
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = inverse ? change < 0 : change > 0;
  const formatted = Math.abs(change).toFixed(1);

  return (
    <span className={`text-xs font-medium flex items-center gap-0.5 ${isPositive ? "text-success" : change === 0 ? "text-muted" : "text-danger"}`}>
      {change > 0 ? "↑" : change < 0 ? "↓" : "="} {formatted}%
    </span>
  );
}

function formatValue(val: number, format: string) {
  switch (format) {
    case "currency": return `$${val.toLocaleString()}`;
    case "percent": return `${val}%`;
    case "multiplier": return `${val}x`;
    case "time": return `${Math.floor(val / 60)}m ${val % 60}s`;
    default: return val.toLocaleString();
  }
}

function ComparisonRow({ label, currentVal, previousVal, format = "number", inverse = false }: {
  label: string; currentVal: number; previousVal: number; format?: string; inverse?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-card-border/50 hover:bg-white/[0.01] px-4">
      <span className="text-sm text-muted-light">{label}</span>
      <div className="flex items-center gap-8">
        <span className="text-sm font-mono text-accent-light w-28 text-right">{formatValue(currentVal, format)}</span>
        <span className="text-sm font-mono text-muted w-28 text-right">{formatValue(previousVal, format)}</span>
        <div className="w-20 text-right">
          <ChangeIndicator current={currentVal} previous={previousVal} inverse={inverse} />
        </div>
      </div>
    </div>
  );
}

function Tip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1b3a] border border-card-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted mb-1">{label}</p>
      {payload.map((e, i) => (
        <p key={i} className="font-semibold" style={{ color: e.color }}>
          {e.name}: {typeof e.value === "number" ? e.value.toLocaleString() : e.value}
        </p>
      ))}
    </div>
  );
}

export default function ComparisonPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(3);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodData | null>(null);
  const [previousPeriod, setPreviousPeriod] = useState<PeriodData | null>(null);

  useEffect(() => {
    loadPreset(selectedPreset);
    setMounted(true);
  }, []);

  function loadPreset(idx: number) {
    const p = presets[idx];
    const now = new Date();
    const currentStart = new Date(now.getTime() - p.a * 86400000);
    const previousStart = new Date(currentStart.getTime() - p.offset * 86400000);
    setCurrentPeriod(generatePeriod(currentStart, p.a, 1));
    setPreviousPeriod(generatePeriod(previousStart, p.b, 0.85 + Math.random() * 0.3));
    setSelectedPreset(idx);
  }

  if (!mounted || !currentPeriod || !previousPeriod) {
    return <div className="p-8"><div className="animate-pulse text-muted">Loading comparison...</div></div>;
  }

  const channelComparison = currentPeriod.channels.map((c, i) => ({
    name: c.name,
    current_revenue: c.revenue,
    previous_revenue: previousPeriod.channels[i]?.revenue || 0,
    current_conversions: c.conversions,
    previous_conversions: previousPeriod.channels[i]?.conversions || 0,
  }));

  return (
    <div className="p-8">
      <PageHeader
        title="Period Comparison"
        subtitle="Compare performance across two time periods side by side"
      />

      {/* Preset selector */}
      <div className="flex items-center gap-2 mb-8">
        {presets.map((p, i) => (
          <button
            key={p.label}
            onClick={() => loadPreset(i)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              selectedPreset === i
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "bg-card-bg text-muted-light border border-card-border hover:border-accent/20 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Revenue", curr: currentPeriod.revenue, prev: previousPeriod.revenue, format: "currency" },
          { label: "Conversions", curr: currentPeriod.conversions, prev: previousPeriod.conversions, format: "number" },
          { label: "ROAS", curr: currentPeriod.roas, prev: previousPeriod.roas, format: "multiplier" },
          { label: "CPA", curr: currentPeriod.cpa, prev: previousPeriod.cpa, format: "currency", inverse: true },
        ].map((m) => {
          const change = m.prev > 0 ? ((m.curr - m.prev) / m.prev) * 100 : 0;
          const isPositive = m.inverse ? change < 0 : change > 0;
          return (
            <div key={m.label} className="bg-card-bg border border-card-border rounded-xl p-5">
              <span className="text-sm text-muted">{m.label}</span>
              <div className="flex items-end gap-3 mt-2">
                <span className="text-2xl font-bold text-white font-mono">{formatValue(m.curr, m.format)}</span>
                <span className={`text-sm font-medium mb-0.5 ${isPositive ? "text-success" : "text-danger"}`}>
                  {change > 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted mt-1">vs {formatValue(m.prev, m.format)}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Channel</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={channelComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={100} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="current_revenue" fill="#6366f1" name="Current Period" barSize={10} radius={[0, 3, 3, 0]} />
              <Bar dataKey="previous_revenue" fill="#64748b" name="Previous Period" barSize={10} radius={[0, 3, 3, 0]} opacity={0.5} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Conversions by Channel</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={channelComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={100} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="current_conversions" fill="#10b981" name="Current Period" barSize={10} radius={[0, 3, 3, 0]} />
              <Bar dataKey="previous_conversions" fill="#64748b" name="Previous Period" barSize={10} radius={[0, 3, 3, 0]} opacity={0.5} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed comparison table */}
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-card-border">
          <h3 className="text-sm font-semibold text-white">Detailed Metrics Comparison</h3>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-accent" />
              <span className="text-xs text-muted-light">Current Period</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <span className="text-xs text-muted-light">Previous Period</span>
            </div>
            <span className="text-xs text-muted">Change</span>
          </div>
        </div>

        <ComparisonRow label="Impressions" currentVal={currentPeriod.impressions} previousVal={previousPeriod.impressions} />
        <ComparisonRow label="Clicks" currentVal={currentPeriod.clicks} previousVal={previousPeriod.clicks} />
        <ComparisonRow label="CTR" currentVal={currentPeriod.ctr} previousVal={previousPeriod.ctr} format="percent" />
        <ComparisonRow label="Sessions" currentVal={currentPeriod.sessions} previousVal={previousPeriod.sessions} />
        <ComparisonRow label="New Users" currentVal={currentPeriod.new_users} previousVal={previousPeriod.new_users} />
        <ComparisonRow label="Returning Users" currentVal={currentPeriod.returning_users} previousVal={previousPeriod.returning_users} />
        <ComparisonRow label="Bounce Rate" currentVal={currentPeriod.bounce_rate} previousVal={previousPeriod.bounce_rate} format="percent" inverse />
        <ComparisonRow label="Avg. Session Duration" currentVal={currentPeriod.avg_duration} previousVal={previousPeriod.avg_duration} format="time" />
        <ComparisonRow label="Conversions" currentVal={currentPeriod.conversions} previousVal={previousPeriod.conversions} />
        <ComparisonRow label="Ad Spend" currentVal={currentPeriod.spend} previousVal={previousPeriod.spend} format="currency" inverse />
        <ComparisonRow label="Revenue" currentVal={currentPeriod.revenue} previousVal={previousPeriod.revenue} format="currency" />
        <ComparisonRow label="ROAS" currentVal={currentPeriod.roas} previousVal={previousPeriod.roas} format="multiplier" />
        <ComparisonRow label="CPA" currentVal={currentPeriod.cpa} previousVal={previousPeriod.cpa} format="currency" inverse />
        <ComparisonRow label="CPL" currentVal={currentPeriod.cpl} previousVal={previousPeriod.cpl} format="currency" inverse />

        {/* Channel breakdown */}
        <div className="px-4 py-3 border-t border-card-border bg-white/[0.01]">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">By Channel</h4>
        </div>
        {currentPeriod.channels.map((c, i) => {
          const prev = previousPeriod.channels[i];
          return (
            <div key={c.name} className="px-4 py-2 border-b border-card-border/30 hover:bg-white/[0.01]">
              <p className="text-xs font-medium text-white mb-2 ml-2">{c.name}</p>
              <div className="grid grid-cols-4 gap-4 ml-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">Spend</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-accent-light">${c.spend.toLocaleString()}</span>
                    <ChangeIndicator current={c.spend} previous={prev?.spend || 0} inverse />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">Revenue</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-success">${c.revenue.toLocaleString()}</span>
                    <ChangeIndicator current={c.revenue} previous={prev?.revenue || 0} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">Conv.</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white">{c.conversions}</span>
                    <ChangeIndicator current={c.conversions} previous={prev?.conversions || 0} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted">ROAS</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-semibold ${c.roas >= 3 ? "text-success" : c.roas >= 1 ? "text-warning" : "text-danger"}`}>{c.roas}x</span>
                    <ChangeIndicator current={c.roas} previous={prev?.roas || 0} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
