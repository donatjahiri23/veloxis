"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { fetchCampaigns, CampaignRow } from "@/lib/db";

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  paused: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  completed: { bg: "bg-muted/10", text: "text-muted-light", dot: "bg-muted" },
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1b3a] border border-card-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<keyof CampaignRow>("roas");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function load() {
      const data = await fetchCampaigns();
      setCampaigns(data);
      setMounted(true);
    }
    load();
  }, []);

  if (!mounted) return <div className="p-8"><div className="animate-pulse text-muted">Loading campaigns...</div></div>;

  const filtered = campaigns
    .filter(c => statusFilter === "all" || c.status === statusFilter)
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      return 0;
    });

  const totals = {
    spent: campaigns.reduce((s, c) => s + c.spent, 0),
    revenue: campaigns.reduce((s, c) => s + c.revenue, 0),
    conversions: campaigns.reduce((s, c) => s + c.conversions, 0),
    impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
  };

  const roasData = campaigns.map(c => ({
    name: c.name,
    roas: c.roas,
    spent: c.spent,
    revenue: c.revenue,
    conversions: c.conversions,
  })).sort((a, b) => b.roas - a.roas);

  const scatterData = campaigns.map(c => ({
    x: c.spent,
    y: c.revenue,
    z: c.conversions,
    name: c.name,
  }));

  const handleSort = (key: keyof CampaignRow) => {
    if (sortBy === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(key); setSortDir("desc"); }
  };

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Campaigns"
        subtitle="Performance analytics across all active and historical campaigns"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <MetricCard label="Total Spend" value={totals.spent} prefix="$" />
        <MetricCard label="Total Revenue" value={totals.revenue} prefix="$" />
        <MetricCard label="Total Conversions" value={totals.conversions} />
        <MetricCard label="Avg ROAS" value={totals.spent > 0 ? (totals.revenue / totals.spent).toFixed(2) : "0"} suffix="x" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">ROAS by Campaign</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roasData.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v}x`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94a3b8" }} width={140} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="roas" fill="#6366f1" radius={[0, 4, 4, 0]} name="ROAS" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Spend vs Revenue (bubble = conversions)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis type="number" dataKey="x" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} name="Spend" />
              <YAxis type="number" dataKey="y" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} name="Revenue" />
              <ZAxis type="number" dataKey="z" range={[40, 400]} name="Conversions" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-[#1a1b3a] border border-card-border rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-xs text-white font-semibold mb-1">{d.name}</p>
                    <p className="text-xs text-muted">Spend: ${d.x.toLocaleString()}</p>
                    <p className="text-xs text-success">Revenue: ${d.y.toLocaleString()}</p>
                    <p className="text-xs text-accent-light">Conversions: {d.z}</p>
                  </div>
                );
              }} />
              <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">All Campaigns</h3>
          <div className="flex items-center bg-background border border-card-border rounded-lg overflow-hidden">
            {["all", "active", "paused", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s ? "bg-accent text-white" : "text-muted-light hover:text-white"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                {[
                  { key: "name", label: "Campaign", align: "left" },
                  { key: "channel", label: "Channel", align: "left" },
                  { key: "status", label: "Status", align: "left" },
                  { key: "spent", label: "Spent", align: "right" },
                  { key: "impressions", label: "Impressions", align: "right" },
                  { key: "clicks", label: "Clicks", align: "right" },
                  { key: "ctr", label: "CTR", align: "right" },
                  { key: "conversions", label: "Conv.", align: "right" },
                  { key: "revenue", label: "Revenue", align: "right" },
                  { key: "roas", label: "ROAS", align: "right" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key as keyof CampaignRow)}
                    className={`py-3 px-3 text-${col.align} text-muted font-medium cursor-pointer hover:text-white transition-colors ${
                      sortBy === col.key ? "text-accent-light" : ""
                    }`}
                  >
                    {col.label}
                    {sortBy === col.key && (
                      <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sc = statusColors[c.status] || statusColors.active;
                return (
                  <tr key={c.id} className="border-b border-card-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-medium text-white">{c.name}</td>
                    <td className="py-3 px-3 text-muted-light">{c.channel}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-muted-light">${c.spent.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono text-muted-light">{c.impressions.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono text-muted-light">{c.clicks.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono text-muted-light">{c.ctr}%</td>
                    <td className="py-3 px-3 text-right font-mono text-white font-semibold">{c.conversions}</td>
                    <td className="py-3 px-3 text-right font-mono text-success">${c.revenue.toLocaleString()}</td>
                    <td className={`py-3 px-3 text-right font-mono font-semibold ${c.roas >= 3 ? "text-success" : c.roas >= 1 ? "text-warning" : "text-danger"}`}>
                      {c.roas}x
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
