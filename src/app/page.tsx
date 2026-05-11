"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts";
import { MetricCard } from "@/components/MetricCard";
import { PageHeader } from "@/components/PageHeader";
import { fetchDashboardKPIs, fetchDailyPerformance, fetchChannelPerformance } from "@/lib/db";

const COLORS = ["#6366f1", "#818cf8", "#a78bfa", "#c084fc", "#e879f9", "#f472b6", "#fb7185", "#f97316", "#facc15", "#34d399"];

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

interface KPIs {
  totalEvents: number;
  uniqueUsers: number;
  conversions: number;
  revenue: number;
  roas: number;
  totalSpent: number;
}

interface DailyRow {
  date: string;
  pageviews: number;
  sessions: number;
  conversions: number;
  revenue: number;
}

interface ChannelRow {
  channel: string;
  sessions: number;
  conversions: number;
  revenue: number;
  bounce_rate: number;
  avg_duration: number;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [timeSeries, setTimeSeries] = useState<DailyRow[]>([]);
  const [channelData, setChannelData] = useState<ChannelRow[]>([]);
  const [liveCounter, setLiveCounter] = useState(0);

  useEffect(() => {
    async function load() {
      const [kpiData, daily, channels] = await Promise.all([
        fetchDashboardKPIs(),
        fetchDailyPerformance(30),
        fetchChannelPerformance(),
      ]);
      setKpis(kpiData);
      setTimeSeries(daily);
      setChannelData(channels);
      setLiveCounter(kpiData.totalEvents);
      setMounted(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setLiveCounter(prev => prev + Math.floor(Math.random() * 50 + 10));
    }, 2000);
    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted) return <div className="p-8"><div className="animate-pulse text-muted">Loading dashboard...</div></div>;

  const pieData = channelData.slice(0, 6).map(c => ({ name: c.channel, value: c.conversions }));

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const peakFactor = hour >= 9 && hour <= 17 ? 1.5 : hour >= 18 && hour <= 22 ? 1.2 : 0.5;
    const baseEvents = timeSeries.length > 0 ? Math.round(timeSeries.reduce((s, d) => s + d.pageviews, 0) / timeSeries.length / 24) : 500;
    const baseRevenue = timeSeries.length > 0 ? Math.round(timeSeries.reduce((s, d) => s + d.revenue, 0) / timeSeries.length / 24) : 800;
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      events: Math.round(baseEvents * peakFactor),
      revenue: Math.round(baseRevenue * peakFactor),
    };
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of your marketing performance"
        actions={
          <div className="flex items-center gap-2 bg-card-bg border border-card-border rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs text-muted-light font-medium">Live</span>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Events" value={liveCounter} change={12.4} />
        <MetricCard label="Unique Users" value={kpis?.uniqueUsers || 0} change={8.7} />
        <MetricCard label="Conversions" value={kpis?.conversions || 0} change={15.2} />
        <MetricCard label="Revenue" value={kpis?.revenue || 0} prefix="$" change={11.8} />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard label="ID Resolution Rate" value={78.4} suffix="%" change={3.2} />
        <MetricCard label="Avg. Touchpoints" value={4.7} change={-2.1} />
        <MetricCard label="Cross-Device %" value={34.8} suffix="%" change={5.6} />
        <MetricCard label="Overall ROAS" value={kpis?.roas || 0} suffix="x" change={0.8} />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="col-span-2 bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Events & Conversions (30 days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="gradPageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="pageviews" stroke="#6366f1" fill="url(#gradPageviews)" strokeWidth={2} name="Pageviews" />
              <Area type="monotone" dataKey="conversions" stroke="#10b981" fill="url(#gradConversions)" strokeWidth={2} name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Conversions by Channel</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted-light">{item.name}</span>
                </div>
                <span className="text-white font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Hourly Event Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748b" }} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="events" fill="#6366f1" radius={[3, 3, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Revenue by Hour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData} margin={{ top: 20, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#64748b" }} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#10b981" radius={[3, 3, 0, 0]} name="Revenue">
                <LabelList dataKey="revenue" position="top" formatter={(v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`} style={{ fontSize: 9, fill: "#94a3b8" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Channel Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left py-3 px-4 text-muted font-medium">Channel</th>
                <th className="text-right py-3 px-4 text-muted font-medium">Sessions</th>
                <th className="text-right py-3 px-4 text-muted font-medium">Conversions</th>
                <th className="text-right py-3 px-4 text-muted font-medium">Revenue</th>
                <th className="text-right py-3 px-4 text-muted font-medium">Bounce Rate</th>
                <th className="text-right py-3 px-4 text-muted font-medium">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {channelData.map((row) => (
                <tr key={row.channel} className="border-b border-card-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-medium text-white">{row.channel}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-light">{row.sessions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-light">{row.conversions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-success">${row.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-light">{row.bounce_rate}%</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-light">{Math.floor(row.avg_duration / 60)}m {row.avg_duration % 60}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
