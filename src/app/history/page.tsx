"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { DateRangePicker } from "@/components/DateRangePicker";
import { generatePerformanceHistory, getAdGroups, getAds, filterOptions, PerformanceRow, ViewLevel } from "@/lib/history-data";

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  paused: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  completed: { bg: "bg-muted/10", text: "text-muted-light", dot: "bg-muted" },
};

type SortKey = keyof PerformanceRow;

const levelTabs: { key: ViewLevel; label: string; icon: React.ReactNode }[] = [
  {
    key: "campaign",
    label: "Campaign",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
  },
  {
    key: "ad_group",
    label: "Ad Group",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
      </svg>
    ),
  },
  {
    key: "ad",
    label: "Ad",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    key: "device",
    label: "Device",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
];

function FilterDropdown({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-muted uppercase tracking-wider font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card-bg border border-card-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent/50 appearance-none cursor-pointer min-w-[140px]"
      >
        <option value="all">All {label}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

const PAGE_SIZE = 25;

export default function HistoryPage() {
  const [allData, setAllData] = useState<PerformanceRow[]>([]);
  const [mounted, setMounted] = useState(false);
  const [viewLevel, setViewLevel] = useState<ViewLevel>("campaign");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [campaign, setCampaign] = useState("all");
  const [adGroup, setAdGroup] = useState("all");
  const [adFilter, setAdFilter] = useState("all");
  const [channel, setChannel] = useState("all");
  const [account, setAccount] = useState("all");
  const [device, setDevice] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const data = generatePerformanceHistory(90);
    setAllData(data);
    const dates = data.map(r => r.date).sort();
    setDateFrom(dates[0]);
    setDateTo(dates[dates.length - 1]);
    setMounted(true);
  }, []);

  const adGroupOptions = useMemo(() => getAdGroups(allData), [allData]);
  const adOptions = useMemo(() => getAds(allData), [allData]);

  const filtered = useMemo(() => {
    return allData.filter(row => {
      if (dateFrom && row.date < dateFrom) return false;
      if (dateTo && row.date > dateTo) return false;
      if (campaign !== "all" && row.campaign !== campaign) return false;
      if (adGroup !== "all" && row.ad_group !== adGroup) return false;
      if (adFilter !== "all" && row.ad !== adFilter) return false;
      if (channel !== "all" && row.channel !== channel) return false;
      if (account !== "all" && row.account !== account) return false;
      if (device !== "all" && row.device !== device) return false;
      if (status !== "all" && row.status !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        return row.campaign.toLowerCase().includes(q) ||
               row.ad_group.toLowerCase().includes(q) ||
               row.ad.toLowerCase().includes(q) ||
               row.channel.toLowerCase().includes(q) ||
               row.account.toLowerCase().includes(q);
      }
      return true;
    }).sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "desc" ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }
      return 0;
    });
  }, [allData, dateFrom, dateTo, campaign, adGroup, adFilter, channel, account, device, status, search, sortBy, sortDir]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const totals = useMemo(() => ({
    impressions: filtered.reduce((s, r) => s + r.impressions, 0),
    clicks: filtered.reduce((s, r) => s + r.clicks, 0),
    conversions: filtered.reduce((s, r) => s + r.conversions, 0),
    cost: filtered.reduce((s, r) => s + r.cost, 0),
    revenue: filtered.reduce((s, r) => s + r.revenue, 0),
  }), [filtered]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(key); setSortDir("desc"); }
    setPage(0);
  };

  const resetFilters = () => {
    const dates = allData.map(r => r.date).sort();
    setDateFrom(dates[0] || "");
    setDateTo(dates[dates.length - 1] || "");
    setCampaign("all");
    setAdGroup("all");
    setAdFilter("all");
    setChannel("all");
    setAccount("all");
    setDevice("all");
    setStatus("all");
    setSearch("");
    setPage(0);
  };

  if (!mounted) return <div className="p-8"><div className="animate-pulse text-muted">Loading performance data...</div></div>;

  const levelColumns: Record<ViewLevel, { key: SortKey; label: string; align: "left" | "right"; format?: (v: PerformanceRow) => React.ReactNode }[]> = {
    campaign: [
      { key: "date", label: "Date", align: "left" },
      { key: "campaign", label: "Campaign", align: "left" },
      { key: "channel", label: "Channel", align: "left" },
      { key: "account", label: "Account", align: "left" },
      { key: "status", label: "Status", align: "left", format: (r) => {
        const sc = statusColors[r.status];
        return (
          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {r.status}
          </span>
        );
      }},
      { key: "impressions", label: "Impr.", align: "right" },
      { key: "clicks", label: "Clicks", align: "right" },
      { key: "ctr", label: "CTR", align: "right", format: (r) => <span>{r.ctr}%</span> },
      { key: "conversions", label: "Conv.", align: "right" },
      { key: "cost", label: "Cost", align: "right", format: (r) => <span>${r.cost.toLocaleString()}</span> },
      { key: "revenue", label: "Revenue", align: "right", format: (r) => <span className="text-success">${r.revenue.toLocaleString()}</span> },
      { key: "roas", label: "ROAS", align: "right", format: (r) => (
        <span className={r.roas >= 3 ? "text-success" : r.roas >= 1 ? "text-warning" : "text-danger"}>{r.roas}x</span>
      )},
      { key: "cpc", label: "CPC", align: "right", format: (r) => <span>${r.cpc}</span> },
      { key: "cpa", label: "CPA", align: "right", format: (r) => <span>${r.cpa}</span> },
    ],
    ad_group: [
      { key: "date", label: "Date", align: "left" },
      { key: "campaign", label: "Campaign", align: "left" },
      { key: "ad_group", label: "Ad Group", align: "left" },
      { key: "channel", label: "Channel", align: "left" },
      { key: "status", label: "Status", align: "left", format: (r) => {
        const sc = statusColors[r.status];
        return (
          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {r.status}
          </span>
        );
      }},
      { key: "impressions", label: "Impr.", align: "right" },
      { key: "clicks", label: "Clicks", align: "right" },
      { key: "ctr", label: "CTR", align: "right", format: (r) => <span>{r.ctr}%</span> },
      { key: "conversions", label: "Conv.", align: "right" },
      { key: "cost", label: "Cost", align: "right", format: (r) => <span>${r.cost.toLocaleString()}</span> },
      { key: "revenue", label: "Revenue", align: "right", format: (r) => <span className="text-success">${r.revenue.toLocaleString()}</span> },
      { key: "roas", label: "ROAS", align: "right", format: (r) => (
        <span className={r.roas >= 3 ? "text-success" : r.roas >= 1 ? "text-warning" : "text-danger"}>{r.roas}x</span>
      )},
      { key: "cpc", label: "CPC", align: "right", format: (r) => <span>${r.cpc}</span> },
    ],
    ad: [
      { key: "date", label: "Date", align: "left" },
      { key: "campaign", label: "Campaign", align: "left" },
      { key: "ad_group", label: "Ad Group", align: "left" },
      { key: "ad", label: "Ad", align: "left" },
      { key: "status", label: "Status", align: "left", format: (r) => {
        const sc = statusColors[r.status];
        return (
          <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
            {r.status}
          </span>
        );
      }},
      { key: "impressions", label: "Impr.", align: "right" },
      { key: "clicks", label: "Clicks", align: "right" },
      { key: "ctr", label: "CTR", align: "right", format: (r) => <span>{r.ctr}%</span> },
      { key: "conversions", label: "Conv.", align: "right" },
      { key: "cost", label: "Cost", align: "right", format: (r) => <span>${r.cost.toLocaleString()}</span> },
      { key: "revenue", label: "Revenue", align: "right", format: (r) => <span className="text-success">${r.revenue.toLocaleString()}</span> },
      { key: "roas", label: "ROAS", align: "right", format: (r) => (
        <span className={r.roas >= 3 ? "text-success" : r.roas >= 1 ? "text-warning" : "text-danger"}>{r.roas}x</span>
      )},
    ],
    device: [
      { key: "date", label: "Date", align: "left" },
      { key: "campaign", label: "Campaign", align: "left" },
      { key: "ad_group", label: "Ad Group", align: "left" },
      { key: "device", label: "Device", align: "left" },
      { key: "channel", label: "Channel", align: "left" },
      { key: "impressions", label: "Impr.", align: "right" },
      { key: "clicks", label: "Clicks", align: "right" },
      { key: "ctr", label: "CTR", align: "right", format: (r) => <span>{r.ctr}%</span> },
      { key: "conversions", label: "Conv.", align: "right" },
      { key: "cost", label: "Cost", align: "right", format: (r) => <span>${r.cost.toLocaleString()}</span> },
      { key: "revenue", label: "Revenue", align: "right", format: (r) => <span className="text-success">${r.revenue.toLocaleString()}</span> },
      { key: "roas", label: "ROAS", align: "right", format: (r) => (
        <span className={r.roas >= 3 ? "text-success" : r.roas >= 1 ? "text-warning" : "text-danger"}>{r.roas}x</span>
      )},
      { key: "bounce_rate", label: "Bounce", align: "right", format: (r) => <span>{r.bounce_rate}%</span> },
      { key: "avg_session_duration", label: "Avg. Duration", align: "right", format: (r) => <span>{Math.floor(r.avg_session_duration / 60)}m {r.avg_session_duration % 60}s</span> },
    ],
  };

  const columns = levelColumns[viewLevel];

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="Performance History"
        subtitle={`${filtered.length.toLocaleString()} records across ${new Set(filtered.map(r => r.date)).size} days`}
        actions={
          <button
            onClick={() => {
              const headers = columns.map(c => c.label).join(",");
              const rows = filtered.map(r => columns.map(c => {
                const v = r[c.key];
                return typeof v === "string" && v.includes(",") ? `"${v}"` : v;
              }).join(","));
              const csv = [headers, ...rows].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `veloxis-${viewLevel}-${dateFrom}-to-${dateTo}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 bg-card-bg border border-card-border rounded-lg px-4 py-2 text-sm text-muted-light hover:text-white hover:border-accent/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export CSV
          </button>
        }
      />

      {/* Level Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-card-bg border border-card-border rounded-xl p-1.5 w-fit">
        {levelTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setViewLevel(tab.key); setPage(0); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewLevel === tab.key
                ? "bg-accent text-white shadow-md shadow-accent/20"
                : "text-muted-light hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card-bg border border-card-border rounded-xl p-5 mb-6">
        <div className="flex items-end gap-4 flex-wrap">
          <DateRangePicker from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(0); }} />
          <FilterDropdown label="Campaign" options={filterOptions.campaigns} value={campaign} onChange={(v) => { setCampaign(v); setAdGroup("all"); setAdFilter("all"); setPage(0); }} />

          {(viewLevel === "ad_group" || viewLevel === "ad" || viewLevel === "device") && (
            <FilterDropdown label="Ad Group" options={adGroupOptions} value={adGroup} onChange={(v) => { setAdGroup(v); setAdFilter("all"); setPage(0); }} />
          )}

          {viewLevel === "ad" && (
            <FilterDropdown label="Ad" options={adOptions} value={adFilter} onChange={(v) => { setAdFilter(v); setPage(0); }} />
          )}

          <FilterDropdown label="Channel" options={filterOptions.channels} value={channel} onChange={(v) => { setChannel(v); setPage(0); }} />
          <FilterDropdown label="Account" options={filterOptions.accounts} value={account} onChange={(v) => { setAccount(v); setPage(0); }} />
          <FilterDropdown label="Device" options={filterOptions.devices} value={device} onChange={(v) => { setDevice(v); setPage(0); }} />
          <FilterDropdown label="Status" options={filterOptions.statuses} value={status} onChange={(v) => { setStatus(v); setPage(0); }} />

          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-muted uppercase tracking-wider font-medium">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="bg-background border border-card-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 w-[160px]"
              />
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="px-3 py-2 text-xs text-muted-light hover:text-white border border-card-border rounded-lg hover:border-accent/30 transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
        <MetricCard label="Total Impressions" value={totals.impressions} />
        <MetricCard label="Total Clicks" value={totals.clicks} />
        <MetricCard label="Total Conversions" value={totals.conversions} />
        <MetricCard label="Total Cost" value={totals.cost} prefix="$" />
        <MetricCard label="Total Revenue" value={totals.revenue} prefix="$" />
      </div>

      {/* Table */}
      <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`py-3 px-3 text-${col.align} text-muted font-medium cursor-pointer hover:text-white transition-colors whitespace-nowrap ${
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
              {paged.map((row) => (
                <tr key={row.id} className="border-b border-card-border/50 hover:bg-white/[0.02] transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`py-2.5 px-3 text-${col.align} font-mono text-muted-light whitespace-nowrap ${
                      col.key === "campaign" || col.key === "date" ? "text-white font-sans font-medium" :
                      col.key === "ad_group" ? "text-accent-light font-sans font-medium" :
                      col.key === "ad" ? "font-sans text-xs max-w-[250px] truncate" :
                      col.key === "channel" || col.key === "account" || col.key === "device" ? "font-sans" : ""
                    }`}>
                      {col.format ? col.format(row) :
                       typeof row[col.key] === "number" ? (row[col.key] as number).toLocaleString() :
                       String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-muted">
                    No records match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-card-border">
            <span className="text-xs text-muted">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(0)}
                disabled={page === 0}
                className="px-2 py-1 text-xs text-muted-light hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 0}
                className="px-2 py-1 text-xs text-muted-light hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i;
                } else if (page < 3) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 7 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-medium transition-all ${
                      page === pageNum
                        ? "bg-accent text-white"
                        : "text-muted-light hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 text-xs text-muted-light hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                className="px-2 py-1 text-xs text-muted-light hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
