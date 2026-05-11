"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";

type ReportType = "performance" | "attribution" | "audience" | "budget" | "executive" | "custom";
type ReportFrequency = "daily" | "weekly" | "biweekly" | "monthly";
type ReportStatus = "scheduled" | "paused" | "draft";

interface Report {
  id: string;
  name: string;
  type: ReportType;
  frequency: ReportFrequency;
  status: ReportStatus;
  recipients: string[];
  last_sent: string | null;
  next_run: string;
  created: string;
  metrics: string[];
  channels: string[];
  description: string;
}

interface GeneratedReport {
  id: string;
  report_id: string;
  report_name: string;
  generated_at: string;
  period: string;
  highlights: string[];
  kpis: { label: string; value: string; change: number }[];
}

const typeConfig: Record<ReportType, { icon: string; label: string; color: string }> = {
  performance: { icon: "📊", label: "Performance", color: "text-accent-light" },
  attribution: { icon: "🔀", label: "Attribution", color: "text-purple-400" },
  audience: { icon: "👥", label: "Audience", color: "text-blue-400" },
  budget: { icon: "💰", label: "Budget", color: "text-success" },
  executive: { icon: "📋", label: "Executive", color: "text-amber-400" },
  custom: { icon: "⚙️", label: "Custom", color: "text-cyan-400" },
};

const frequencyLabels: Record<ReportFrequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
};

function generateReports(): Report[] {
  return [
    {
      id: "rpt_1",
      name: "Weekly Performance Summary",
      type: "performance",
      frequency: "weekly",
      status: "scheduled",
      recipients: ["donat@veloxis.io", "team@veloxis.io"],
      last_sent: "2026-05-04",
      next_run: "2026-05-11",
      created: "2026-02-15",
      metrics: ["Impressions", "Clicks", "CTR", "Conversions", "Revenue", "ROAS", "CPA"],
      channels: ["Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads"],
      description: "Cross-channel performance overview with week-over-week comparisons and top/bottom campaign highlights.",
    },
    {
      id: "rpt_2",
      name: "Monthly Executive Dashboard",
      type: "executive",
      frequency: "monthly",
      status: "scheduled",
      recipients: ["donat@veloxis.io", "ceo@veloxis.io", "cfo@veloxis.io"],
      last_sent: "2026-05-01",
      next_run: "2026-06-01",
      created: "2026-01-10",
      metrics: ["Revenue", "ROAS", "CAC", "LTV", "Pipeline Value", "Conversion Rate"],
      channels: ["All Channels"],
      description: "High-level monthly report for leadership with spend efficiency, revenue attribution, and strategic recommendations.",
    },
    {
      id: "rpt_3",
      name: "Attribution Model Comparison",
      type: "attribution",
      frequency: "biweekly",
      status: "scheduled",
      recipients: ["donat@veloxis.io", "analytics@veloxis.io"],
      last_sent: "2026-04-28",
      next_run: "2026-05-12",
      created: "2026-03-01",
      metrics: ["Attributed Revenue", "Model Variance", "Channel Weight", "Path Length"],
      channels: ["All Channels"],
      description: "Bi-weekly comparison of attribution models (Last Touch, First Touch, Linear, Data-Driven) to identify channel valuation discrepancies.",
    },
    {
      id: "rpt_4",
      name: "Budget Pacing Alert",
      type: "budget",
      frequency: "daily",
      status: "scheduled",
      recipients: ["donat@veloxis.io"],
      last_sent: "2026-05-10",
      next_run: "2026-05-11",
      created: "2026-04-01",
      metrics: ["Daily Spend", "Budget Utilization", "Projected Spend", "ROAS"],
      channels: ["Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads", "Display", "YouTube"],
      description: "Daily budget pacing alerts with overspend/underspend flags and projected month-end totals per channel.",
    },
    {
      id: "rpt_5",
      name: "Audience Segment Analysis",
      type: "audience",
      frequency: "monthly",
      status: "scheduled",
      recipients: ["donat@veloxis.io", "growth@veloxis.io"],
      last_sent: "2026-05-01",
      next_run: "2026-06-01",
      created: "2026-02-20",
      metrics: ["Segment Size", "CTR", "Conversion Rate", "ROAS", "Overlap %"],
      channels: ["Meta Ads", "Google Ads", "LinkedIn Ads"],
      description: "Monthly deep-dive into audience segments including lookalike performance, retargeting decay curves, and overlap analysis.",
    },
    {
      id: "rpt_6",
      name: "Creative Fatigue Tracker",
      type: "performance",
      frequency: "weekly",
      status: "paused",
      recipients: ["donat@veloxis.io", "creative@veloxis.io"],
      last_sent: "2026-04-20",
      next_run: "-",
      created: "2026-03-15",
      metrics: ["Fatigue Score", "CTR Trend", "Frequency", "CPM Trend"],
      channels: ["Meta Ads", "TikTok Ads", "Display"],
      description: "Tracks creative fatigue across ad sets by monitoring CTR decline, frequency increase, and CPM inflation over time.",
    },
    {
      id: "rpt_7",
      name: "Geo Performance Report",
      type: "custom",
      frequency: "monthly",
      status: "draft",
      recipients: ["donat@veloxis.io"],
      last_sent: null,
      next_run: "-",
      created: "2026-05-08",
      metrics: ["Revenue", "ROAS", "CPA", "Conversion Rate"],
      channels: ["All Channels"],
      description: "Regional performance breakdown with top/bottom market identification and geo-bid adjustment recommendations.",
    },
    {
      id: "rpt_8",
      name: "Channel Mix Optimization",
      type: "budget",
      frequency: "biweekly",
      status: "scheduled",
      recipients: ["donat@veloxis.io", "media@veloxis.io"],
      last_sent: "2026-04-28",
      next_run: "2026-05-12",
      created: "2026-03-20",
      metrics: ["Spend Share", "Revenue Share", "Marginal ROAS", "Incremental CPA"],
      channels: ["All Channels"],
      description: "Analyzes marginal returns by channel to recommend optimal budget reallocation for maximum incremental revenue.",
    },
  ];
}

function generatePastReports(): GeneratedReport[] {
  return [
    {
      id: "gen_1",
      report_id: "rpt_1",
      report_name: "Weekly Performance Summary",
      generated_at: "2026-05-04 08:00",
      period: "Apr 28 – May 4, 2026",
      highlights: [
        "Overall ROAS improved 12% WoW to 3.4x",
        "TikTok Ads CPA decreased 18% after creative refresh",
        "LinkedIn Ads conversions up 24% from new audience targeting",
        "Display remarketing flagged for review — ROAS below 1.0x",
      ],
      kpis: [
        { label: "Revenue", value: "$127,450", change: 8.2 },
        { label: "ROAS", value: "3.4x", change: 12.0 },
        { label: "Conversions", value: "487", change: 5.6 },
        { label: "CPA", value: "$68.20", change: -9.4 },
        { label: "Spend", value: "$37,485", change: 2.1 },
        { label: "CTR", value: "2.14%", change: 3.8 },
      ],
    },
    {
      id: "gen_2",
      report_id: "rpt_2",
      report_name: "Monthly Executive Dashboard",
      generated_at: "2026-05-01 06:00",
      period: "April 2026",
      highlights: [
        "Monthly revenue hit $498K, 15% above target",
        "Google Ads drove 42% of total attributed revenue",
        "Customer acquisition cost dropped to $54 from $63 in March",
        "Data-Driven attribution model surfaced 23% more value for top-of-funnel channels",
      ],
      kpis: [
        { label: "Revenue", value: "$498,200", change: 15.3 },
        { label: "ROAS", value: "3.1x", change: 7.0 },
        { label: "CAC", value: "$54.00", change: -14.3 },
        { label: "Pipeline", value: "$1.2M", change: 22.0 },
        { label: "Total Spend", value: "$160,710", change: 4.8 },
        { label: "LTV/CAC", value: "4.8x", change: 11.6 },
      ],
    },
    {
      id: "gen_3",
      report_id: "rpt_4",
      report_name: "Budget Pacing Alert",
      generated_at: "2026-05-10 07:00",
      period: "May 1 – May 10, 2026",
      highlights: [
        "Meta Ads 8% over pace — projected to exceed budget by $3,200",
        "Google Ads on track at 98% pace",
        "LinkedIn Ads underspending — only 78% of daily target utilized",
        "Overall month projected spend: $168K vs $165K budget",
      ],
      kpis: [
        { label: "MTD Spend", value: "$55,340", change: 0 },
        { label: "Pace", value: "101.2%", change: 1.2 },
        { label: "Projected", value: "$168K", change: 1.8 },
        { label: "Budget", value: "$165K", change: 0 },
        { label: "Days Left", value: "21", change: 0 },
        { label: "Daily Target", value: "$5,500", change: 0 },
      ],
    },
    {
      id: "gen_4",
      report_id: "rpt_3",
      report_name: "Attribution Model Comparison",
      generated_at: "2026-04-28 08:00",
      period: "Apr 14 – Apr 28, 2026",
      highlights: [
        "Data-Driven model assigns 31% more credit to Meta Ads vs Last Touch",
        "Email channel undervalued by 2.4x under Last Touch model",
        "Position-Based closely tracks Data-Driven for this period",
        "Avg. conversion path length: 4.7 touchpoints across 2.3 devices",
      ],
      kpis: [
        { label: "Avg Path Length", value: "4.7", change: 0 },
        { label: "Model Variance", value: "±18%", change: 0 },
        { label: "Top Channel", value: "Google", change: 0 },
        { label: "Undervalued", value: "Email", change: 0 },
        { label: "Conversions", value: "934", change: 11.2 },
        { label: "Revenue", value: "$245K", change: 8.7 },
      ],
    },
  ];
}

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [pastReports, setPastReports] = useState<GeneratedReport[]>([]);
  const [activeTab, setActiveTab] = useState<"scheduled" | "history">("scheduled");
  const [filterType, setFilterType] = useState<ReportType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "all">("all");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [expandedGenerated, setExpandedGenerated] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    setReports(generateReports());
    setPastReports(generatePastReports());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background p-8 ml-64"><div className="animate-pulse text-muted">Loading reports...</div></div>;
  }

  const filteredReports = reports.filter(r => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const scheduledCount = reports.filter(r => r.status === "scheduled").length;
  const pausedCount = reports.filter(r => r.status === "paused").length;
  const draftCount = reports.filter(r => r.status === "draft").length;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <PageHeader
        title="Automated Reports"
        subtitle="Schedule, manage, and review automated marketing reports"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {[
          { label: "Scheduled Reports", value: scheduledCount, color: "text-success" },
          { label: "Paused", value: pausedCount, color: "text-warning" },
          { label: "Drafts", value: draftCount, color: "text-muted-light" },
          { label: "Reports Sent (May)", value: pastReports.length, color: "text-accent-light" },
        ].map(stat => (
          <div key={stat.label} className="bg-card-bg border border-card-border rounded-xl p-4">
            <p className="text-xs text-muted mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 mb-6 border-b border-card-border">
        {(["scheduled", "history"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-accent text-accent-light"
                : "border-transparent text-muted hover:text-text-primary"
            }`}
          >
            {tab === "scheduled" ? "Scheduled Reports" : "Report History"}
          </button>
        ))}

        <button
          onClick={() => setShowCreateModal(!showCreateModal)}
          className="ml-auto mb-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/80 transition-colors"
        >
          + New Report
        </button>
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="bg-card-bg border border-accent/30 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Create New Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-4">
            {(Object.entries(typeConfig) as [ReportType, typeof typeConfig[ReportType]][]).map(([key, cfg]) => (
              <button
                key={key}
                className="bg-card-bg border border-card-border rounded-lg p-4 hover:border-accent/40 transition-colors text-left"
              >
                <span className="text-2xl">{cfg.icon}</span>
                <p className={`text-sm font-medium mt-2 ${cfg.color}`}>{cfg.label} Report</p>
                <p className="text-xs text-muted mt-1">
                  {key === "performance" && "Track KPIs across campaigns and channels"}
                  {key === "attribution" && "Compare attribution models and channel credit"}
                  {key === "audience" && "Segment performance and overlap analysis"}
                  {key === "budget" && "Pacing, spend efficiency, and forecasting"}
                  {key === "executive" && "High-level summary for leadership"}
                  {key === "custom" && "Build a report from scratch"}
                </p>
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-sm text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/80 transition-colors">
              Continue Setup →
            </button>
          </div>
        </div>
      )}

      {activeTab === "scheduled" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as ReportType | "all")}
              className="bg-card-bg border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary"
            >
              <option value="all">All Types</option>
              {(Object.entries(typeConfig) as [ReportType, typeof typeConfig[ReportType]][]).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as ReportStatus | "all")}
              className="bg-card-bg border border-card-border rounded-lg px-3 py-2 text-sm text-text-primary"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Report Cards */}
          <div className="space-y-3">
            {filteredReports.map(report => {
              const cfg = typeConfig[report.type];
              const isExpanded = expandedReport === report.id;

              return (
                <div key={report.id} className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
                  <div
                    className="p-5 cursor-pointer hover:bg-hover-bg transition-colors"
                    onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <span className="text-2xl mt-0.5">{cfg.icon}</span>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-text-primary font-semibold">{report.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              report.status === "scheduled" ? "bg-success/10 text-success" :
                              report.status === "paused" ? "bg-warning/10 text-warning" :
                              "bg-white/5 text-muted-light"
                            }`}>
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted mt-1">{report.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                            <span>{frequencyLabels[report.frequency]}</span>
                            <span>•</span>
                            <span>{report.recipients.length} recipient{report.recipients.length !== 1 ? "s" : ""}</span>
                            <span>•</span>
                            <span>Next: {report.next_run}</span>
                            {report.last_sent && (
                              <>
                                <span>•</span>
                                <span>Last sent: {report.last_sent}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setReports(prev => prev.map(r =>
                              r.id === report.id
                                ? { ...r, status: r.status === "scheduled" ? "paused" : "scheduled" }
                                : r
                            ));
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            report.status === "scheduled"
                              ? "border-warning/30 text-warning hover:bg-warning/10"
                              : "border-success/30 text-success hover:bg-success/10"
                          }`}
                        >
                          {report.status === "scheduled" ? "Pause" : "Resume"}
                        </button>
                        <svg
                          className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-card-border pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                        <div>
                          <p className="text-xs text-muted mb-2 uppercase tracking-wider">Metrics Included</p>
                          <div className="flex flex-wrap gap-1.5">
                            {report.metrics.map(m => (
                              <span key={m} className="text-xs bg-accent/10 text-accent-light px-2 py-1 rounded">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-2 uppercase tracking-wider">Channels</p>
                          <div className="flex flex-wrap gap-1.5">
                            {report.channels.map(c => (
                              <span key={c} className="text-xs bg-white/5 text-muted-light px-2 py-1 rounded">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-2 uppercase tracking-wider">Recipients</p>
                          <div className="space-y-1">
                            {report.recipients.map(r => (
                              <p key={r} className="text-xs text-muted-light font-mono">{r}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-card-border">
                        <button className="px-3 py-1.5 text-xs bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors">
                          Run Now
                        </button>
                        <button className="px-3 py-1.5 text-xs border border-card-border text-muted-light rounded-lg hover:bg-white/5 transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1.5 text-xs border border-card-border text-muted-light rounded-lg hover:bg-white/5 transition-colors">
                          Duplicate
                        </button>
                        <button
                          onClick={() => setReports(prev => prev.filter(r => r.id !== report.id))}
                          className="px-3 py-1.5 text-xs border border-danger/30 text-danger rounded-lg hover:bg-danger/10 transition-colors ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {pastReports.map(gen => {
            const isExpanded = expandedGenerated === gen.id;

            return (
              <div key={gen.id} className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-hover-bg transition-colors"
                  onClick={() => setExpandedGenerated(isExpanded ? null : gen.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-text-primary font-semibold">{gen.report_name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                        <span>Period: {gen.period}</span>
                        <span>•</span>
                        <span>Generated: {gen.generated_at}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-3 py-1.5 text-xs border border-card-border text-muted-light rounded-lg hover:bg-white/5 transition-colors">
                        Download PDF
                      </button>
                      <svg
                        className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-card-border pt-4">
                    {/* KPIs */}
                    <div className="grid grid-cols-6 gap-3 mb-5">
                      {gen.kpis.map(kpi => (
                        <div key={kpi.label} className="bg-background rounded-lg p-3">
                          <p className="text-xs text-muted">{kpi.label}</p>
                          <p className="text-lg font-bold text-text-primary font-mono mt-0.5">{kpi.value}</p>
                          {kpi.change !== 0 && (
                            <p className={`text-xs mt-0.5 ${
                              kpi.label === "CPA" || kpi.label === "CAC"
                                ? kpi.change < 0 ? "text-success" : "text-danger"
                                : kpi.change > 0 ? "text-success" : "text-danger"
                            }`}>
                              {kpi.change > 0 ? "↑" : "↓"} {Math.abs(kpi.change)}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Highlights */}
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-2">Key Highlights</p>
                      <ul className="space-y-2">
                        {gen.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-light">
                            <span className="text-accent-light mt-0.5">•</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-card-border">
                      <button className="px-3 py-1.5 text-xs bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors">
                        Re-generate
                      </button>
                      <button className="px-3 py-1.5 text-xs border border-card-border text-muted-light rounded-lg hover:bg-white/5 transition-colors">
                        Share
                      </button>
                      <button className="px-3 py-1.5 text-xs border border-card-border text-muted-light rounded-lg hover:bg-white/5 transition-colors">
                        View Full Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
