"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { fetchAttribution, AttributionRow } from "@/lib/db";

type Model = "last_touch" | "first_touch" | "linear" | "time_decay" | "position_based" | "data_driven";

const models: { key: Model; label: string; description: string }[] = [
  { key: "last_touch", label: "Last Touch", description: "100% credit to the final touchpoint before conversion" },
  { key: "first_touch", label: "First Touch", description: "100% credit to the first touchpoint in the journey" },
  { key: "linear", label: "Linear", description: "Equal credit distributed across all touchpoints" },
  { key: "time_decay", label: "Time Decay", description: "More credit to touchpoints closer to conversion" },
  { key: "position_based", label: "Position Based", description: "40% first, 40% last, 20% split across middle" },
  { key: "data_driven", label: "Data-Driven (AI)", description: "ML-powered Shapley value attribution" },
];

const MODEL_COLORS: Record<Model, string> = {
  last_touch: "#ef4444",
  first_touch: "#f97316",
  linear: "#facc15",
  time_decay: "#10b981",
  position_based: "#6366f1",
  data_driven: "#a78bfa",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-tooltip-bg border border-card-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) + "%" : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function AttributionPage() {
  const [selectedModel, setSelectedModel] = useState<Model>("data_driven");
  const [compareModel, setCompareModel] = useState<Model | null>(null);
  const [data, setData] = useState<AttributionRow[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function load() {
      const rows = await fetchAttribution();
      setData(rows);
      setMounted(true);
    }
    load();
  }, []);

  if (!mounted) return <div className="p-8"><div className="animate-pulse text-muted">Loading attribution...</div></div>;

  const sortedData = [...data].sort((a, b) => b[selectedModel] - a[selectedModel]);

  const radarData = data.slice(0, 6).map(d => ({
    channel: d.channel.replace(" Ads", "").replace("Organic ", "Org. "),
    "Last Touch": d.last_touch,
    "First Touch": d.first_touch,
    "Linear": d.linear,
    "Time Decay": d.time_decay,
    "Position Based": d.position_based,
    "Data-Driven": d.data_driven,
  }));

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Attribution Engine"
        subtitle="Multi-touch attribution modeling across all channels and touchpoints"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
        {models.map((model) => (
          <button
            key={model.key}
            onClick={() => {
              if (selectedModel === model.key) return;
              if (compareModel === model.key) { setCompareModel(null); return; }
              setSelectedModel(model.key);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (model.key !== selectedModel) setCompareModel(model.key === compareModel ? null : model.key);
            }}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
              selectedModel === model.key
                ? "bg-accent/15 border-accent/40 ring-1 ring-accent/20"
                : compareModel === model.key
                ? "bg-warning/10 border-warning/30"
                : "bg-card-bg border-card-border hover:border-accent/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MODEL_COLORS[model.key] }} />
              <span className={`text-sm font-semibold ${selectedModel === model.key ? "text-accent-light" : "text-text-primary"}`}>
                {model.label}
              </span>
              {model.key === "data_driven" && (
                <span className="text-[10px] bg-accent/20 text-accent-light px-1.5 py-0.5 rounded-full font-medium">AI</span>
              )}
            </div>
            <p className="text-xs text-muted leading-relaxed">{model.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="col-span-2 bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            Channel Attribution — {models.find(m => m.key === selectedModel)?.label}
            {compareModel && ` vs ${models.find(m => m.key === compareModel)?.label}`}
          </h3>
          <p className="text-xs text-muted mb-4">Percentage of conversion credit per channel</p>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2044" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="channel" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={selectedModel} fill={MODEL_COLORS[selectedModel]} radius={[0, 4, 4, 0]} name={models.find(m => m.key === selectedModel)?.label || ""} barSize={compareModel ? 14 : 22} />
              {compareModel && (
                <Bar dataKey={compareModel} fill={MODEL_COLORS[compareModel]} radius={[0, 4, 4, 0]} name={models.find(m => m.key === compareModel)?.label || ""} barSize={14} opacity={0.7} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Model Comparison Radar</h3>
          <p className="text-xs text-muted mb-4">All models across top channels</p>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e2044" />
              <PolarAngleAxis dataKey="channel" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: "#64748b" }} />
              <Radar name="Data-Driven" dataKey="Data-Driven" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Last Touch" dataKey="Last Touch" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} strokeWidth={1} />
              <Radar name="Linear" dataKey="Linear" stroke="#facc15" fill="#facc15" fillOpacity={0.05} strokeWidth={1} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card-bg border border-card-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Detailed Attribution Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-left py-3 px-4 text-muted font-medium">Channel</th>
                <th className="text-right py-3 px-4 text-muted font-medium">Conversions</th>
                <th className="text-right py-3 px-4 text-muted font-medium">Revenue</th>
                {models.map(m => (
                  <th key={m.key} className={`text-right py-3 px-4 font-medium ${selectedModel === m.key ? "text-accent-light" : "text-muted"}`}>
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row) => (
                <tr key={row.channel} className="border-b border-card-border/50 hover:bg-hover-bg transition-colors">
                  <td className="py-3 px-4 font-medium text-text-primary">{row.channel}</td>
                  <td className="py-3 px-4 text-right font-mono text-muted-light">{row.conversions}</td>
                  <td className="py-3 px-4 text-right font-mono text-success">${row.revenue.toLocaleString()}</td>
                  {models.map(m => (
                    <td key={m.key} className={`py-3 px-4 text-right font-mono ${selectedModel === m.key ? "text-accent-light font-semibold" : "text-muted-light"}`}>
                      {row[m.key].toFixed(1)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
