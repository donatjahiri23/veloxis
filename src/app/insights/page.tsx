"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ComposedChart, Legend, LabelList
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import {
  generateFunnelData, generateDaypartData, generateBudgetPacing,
} from "@/lib/insights-data";
import { fetchCostTrend, fetchCreatives, fetchAudienceSegments, fetchGeoPerformance } from "@/lib/db";

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

function FunnelChart({ data }: { data: ReturnType<typeof generateFunnelData> }) {
  const maxVal = data[0].value;
  return (
    <div className="space-y-3">
      {data.map((stage, i) => {
        const width = Math.max((stage.value / maxVal) * 100, 8);
        const dropoff = i > 0 ? ((data[i - 1].value - stage.value) / data[i - 1].value * 100).toFixed(1) : null;
        return (
          <div key={stage.stage} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white">{stage.stage}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-light">{stage.value.toLocaleString()}</span>
                {dropoff && (
                  <span className="text-[10px] text-danger font-mono">-{dropoff}%</span>
                )}
              </div>
            </div>
            <div className="h-8 bg-card-border/30 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-3"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, ${i === data.length - 1 ? '#10b981' : '#6366f1'}, ${i === data.length - 1 ? '#34d399' : '#818cf8'})`,
                }}
              >
                <span className="text-[10px] font-bold text-white/90">{stage.rate}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = Math.min(value / max, 1);
  const bg = intensity > 0.7
    ? `rgba(16, 185, 129, ${intensity * 0.8})`
    : intensity > 0.3
    ? `rgba(99, 102, 241, ${intensity * 0.7})`
    : `rgba(100, 116, 139, ${Math.max(intensity * 0.5, 0.05)})`;

  return (
    <div
      className="w-full h-7 rounded-sm flex items-center justify-center text-[9px] font-mono transition-all hover:ring-1 hover:ring-white/30"
      style={{ backgroundColor: bg }}
      title={`${value} conversions`}
    >
      {value > 0 ? value : ""}
    </div>
  );
}

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const [funnel, setFunnel] = useState<ReturnType<typeof generateFunnelData>>([]);
  const [costTrend, setCostTrend] = useState<Awaited<ReturnType<typeof fetchCostTrend>>>([]);
  const [creatives, setCreatives] = useState<Awaited<ReturnType<typeof fetchCreatives>>>([]);
  const [daypart, setDaypart] = useState<ReturnType<typeof generateDaypartData>>([]);
  const [audiences, setAudiences] = useState<Awaited<ReturnType<typeof fetchAudienceSegments>>>([]);
  const [geo, setGeo] = useState<Awaited<ReturnType<typeof fetchGeoPerformance>>>([]);
  const [budget, setBudget] = useState<ReturnType<typeof generateBudgetPacing>>([]);

  useEffect(() => {
    async function load() {
      const [costData, creativesData, audiencesData, geoData] = await Promise.all([
        fetchCostTrend(30),
        fetchCreatives(),
        fetchAudienceSegments(),
        fetchGeoPerformance(),
      ]);
      setFunnel(generateFunnelData());
      setCostTrend(costData);
      setCreatives(creativesData);
      setDaypart(generateDaypartData());
      setAudiences(audiencesData);
      setGeo(geoData);
      setBudget(generateBudgetPacing());
      setMounted(true);
    }
    load();
  }, []);

  if (!mounted) return <div className="p-8"><div className="animate-pulse text-muted">Loading insights...</div></div>;

  const totalSpend = costTrend[costTrend.length - 1]?.cumulative_spend || 0;
  const totalRevenue = costTrend[costTrend.length - 1]?.cumulative_revenue || 0;
  const overallROAS = totalSpend > 0 ? (totalRevenue / totalSpend).toFixed(2) : "0";
  const avgCPA = costTrend.length > 0 ? (costTrend.reduce((s, d) => s + d.cpa, 0) / costTrend.length).toFixed(2) : "0";

  const maxDaypartConv = Math.max(...daypart.map(d => d.conversions));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Insights"
        subtitle="Deep performance analytics — what's working, what's not, and where to invest"
      />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <MetricCard label="Total Ad Spend" value={totalSpend} prefix="$" change={-3.2} />
        <MetricCard label="Total Revenue" value={totalRevenue} prefix="$" change={11.8} />
        <MetricCard label="Overall ROAS" value={overallROAS} suffix="x" change={8.4} />
        <MetricCard label="Avg. CPA" value={avgCPA} prefix="$" change={-5.1} />
      </div>

      {/* Row 1: Funnel + Cost Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Conversion Funnel</h3>
          <p className="text-xs text-muted mb-5">Full-funnel drop-off analysis from impression to conversion</p>
          <FunnelChart data={funnel} />
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Spend vs Revenue (30 days)</h3>
          <p className="text-xs text-muted mb-4">Daily ad spend against revenue with ROAS trend line</p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={costTrend}>
              <defs>
                <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v}x`} />
              <Tooltip content={<Tip />} />
              <Area yAxisId="left" type="monotone" dataKey="daily_spend" stroke="#ef4444" fill="url(#gradSpend)" strokeWidth={1.5} name="Spend" />
              <Area yAxisId="left" type="monotone" dataKey="daily_revenue" stroke="#10b981" fill="url(#gradRev)" strokeWidth={1.5} name="Revenue" />
              <Line yAxisId="right" type="monotone" dataKey="daily_roas" stroke="#facc15" strokeWidth={2} dot={false} name="ROAS" />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: CPA/CPL Trend + Budget Pacing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">CPA & Cost per Lead Trend</h3>
          <p className="text-xs text-muted mb-4">Are acquisition costs going up or down?</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={costTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="cpa" stroke="#ef4444" strokeWidth={2} dot={false} name="CPA" />
              <Line type="monotone" dataKey="cpl" stroke="#6366f1" strokeWidth={2} dot={false} name="CPL" />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Budget Pacing</h3>
          <p className="text-xs text-muted mb-4">Are you on track to hit monthly budget targets?</p>
          <div className="space-y-4">
            {budget.map((b) => {
              const pct = Math.min((b.spent / b.budget) * 100, 100);
              const projectedPct = Math.min((b.projected_spend / b.budget) * 100, 150);
              return (
                <div key={b.channel}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-white">{b.channel}</span>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="text-muted-light">${b.spent.toLocaleString()} / ${b.budget.toLocaleString()}</span>
                      <span className={b.on_track ? "text-success" : b.over_budget ? "text-danger" : "text-warning"}>
                        {b.pace}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 bg-card-border/30 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.over_budget ? "bg-danger" : b.on_track ? "bg-success" : "bg-warning"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                    <div
                      className="absolute top-0 h-full border-r-2 border-dashed border-white/30"
                      style={{ left: `${Math.min(projectedPct, 100)}%` }}
                      title={`Projected: $${b.projected_spend.toLocaleString()}`}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted">{b.days_remaining} days left</span>
                    <span className="text-[9px] text-muted">Projected: ${b.projected_spend.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Daypart Heatmap */}
      <div className="bg-card-bg border border-card-border rounded-xl p-4 lg:p-5 mb-6 lg:mb-8">
        <h3 className="text-sm font-semibold text-white mb-1">Daypart Performance Heatmap</h3>
        <p className="text-xs text-muted mb-4">Conversions by day of week and hour — find your best windows</p>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid gap-0.5" style={{ gridTemplateColumns: `60px repeat(24, 1fr)` }}>
              <div />
              {hours.map(h => (
                <div key={h} className="text-center text-[9px] text-muted font-mono py-1">
                  {h.toString().padStart(2, "0")}
                </div>
              ))}
              {days.map(day => (
                <React.Fragment key={day}>
                  <div className="flex items-center text-xs text-muted-light font-medium">{day}</div>
                  {hours.map(hour => {
                    const cell = daypart.find(d => d.day === day && d.hour === hour);
                    return (
                      <HeatmapCell key={`${day}-${hour}`} value={cell?.conversions || 0} max={maxDaypartConv} />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Creative Performance + Audience Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Creative Performance</h3>
          <p className="text-xs text-muted mb-4">Which ads are driving results? Watch for fatigue.</p>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {creatives.map((c, i) => (
              <div key={i} className="border border-card-border rounded-lg p-3 hover:border-accent/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{c.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded">{c.format}</span>
                      {c.duration !== "-" && <span className="text-[10px] text-muted">{c.duration}</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-mono font-bold ${c.roas >= 3 ? "text-success" : c.roas >= 1.5 ? "text-warning" : "text-danger"}`}>
                    {c.roas}x
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <span className="text-muted">Clicks</span>
                    <p className="text-white font-mono">{c.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted">Conv.</span>
                    <p className="text-white font-mono">{c.conversions}</p>
                  </div>
                  <div>
                    <span className="text-muted">CTR</span>
                    <p className="text-white font-mono">{c.ctr}%</p>
                  </div>
                  <div>
                    <span className="text-muted">Fatigue</span>
                    <p className={`font-mono ${c.fatigue_score > 70 ? "text-danger" : c.fatigue_score > 40 ? "text-warning" : "text-success"}`}>
                      {c.fatigue_score}/100
                    </p>
                  </div>
                </div>
                {c.fatigue_score > 70 && (
                  <div className="mt-2 text-[10px] text-danger bg-danger/10 rounded px-2 py-1">
                    High fatigue — consider refreshing this creative
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-1">Audience Segments</h3>
          <p className="text-xs text-muted mb-4">Which audiences convert best? Where to scale spend.</p>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-[11px]">
              <thead className="sticky top-0 bg-card-bg">
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 px-2 text-muted font-medium">Audience</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">Size</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">Conv.</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">CVR</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">CPA</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">ROAS</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">Overlap</th>
                </tr>
              </thead>
              <tbody>
                {audiences.map((a, i) => (
                  <tr key={i} className="border-b border-card-border/50 hover:bg-white/[0.02]">
                    <td className="py-2 px-2 font-medium text-white max-w-[160px] truncate">{a.name}</td>
                    <td className="py-2 px-2 text-right font-mono text-muted-light">
                      {a.size > 1000000 ? `${(a.size / 1000000).toFixed(1)}M` : `${(a.size / 1000).toFixed(0)}K`}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-white">{a.conversions}</td>
                    <td className="py-2 px-2 text-right font-mono text-muted-light">{a.conversion_rate}%</td>
                    <td className="py-2 px-2 text-right font-mono text-muted-light">${a.cpa}</td>
                    <td className={`py-2 px-2 text-right font-mono font-semibold ${a.roas >= 3 ? "text-success" : a.roas >= 1.5 ? "text-warning" : "text-danger"}`}>
                      {a.roas}x
                    </td>
                    <td className={`py-2 px-2 text-right font-mono ${a.overlap > 20 ? "text-warning" : "text-muted-light"}`}>
                      {a.overlap}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 5: Geo Performance */}
      <div className="bg-card-bg border border-card-border rounded-xl p-4 lg:p-5 mb-6 lg:mb-8">
        <h3 className="text-sm font-semibold text-white mb-1">Geographic Performance</h3>
        <p className="text-xs text-muted mb-4">Revenue and efficiency by region — identify expansion opportunities</p>
        <div className="grid grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={geo.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={110} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} name="Revenue" barSize={16} />
              <Bar dataKey="spend" fill="#ef4444" radius={[0, 4, 4, 0]} name="Spend" barSize={16} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-left py-2 px-2 text-muted font-medium">Region</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">Conv.</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">Revenue</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">CPA</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">ROAS</th>
                  <th className="text-right py-2 px-2 text-muted font-medium">AOV</th>
                </tr>
              </thead>
              <tbody>
                {geo.map((g, i) => (
                  <tr key={i} className="border-b border-card-border/50 hover:bg-white/[0.02]">
                    <td className="py-2 px-2">
                      <span className="text-white font-medium">{g.region}</span>
                      <span className="text-muted ml-1 text-[9px]">{g.country}</span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-white">{g.conversions}</td>
                    <td className="py-2 px-2 text-right font-mono text-success">${g.revenue.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-mono text-muted-light">${g.cpa}</td>
                    <td className={`py-2 px-2 text-right font-mono font-semibold ${g.roas >= 3 ? "text-success" : g.roas >= 1.5 ? "text-warning" : "text-danger"}`}>
                      {g.roas}x
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-muted-light">${g.avg_order_value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 6: Cumulative ROAS curve */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Cumulative ROAS Curve</h3>
        <p className="text-xs text-muted mb-4">How your total return on ad spend builds over time</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={costTrend}>
            <defs>
              <linearGradient id="gradCumRoas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v}x`} domain={["auto", "auto"]} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="cumulative_roas" stroke="#6366f1" fill="url(#gradCumRoas)" strokeWidth={2.5} name="Cumulative ROAS" />
            {/* Break-even line */}
            <Line type="monotone" dataKey={() => 1} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Break-even (1x)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
