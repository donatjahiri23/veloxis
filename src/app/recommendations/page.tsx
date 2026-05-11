"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";

type Priority = "critical" | "high" | "medium" | "low";
type Category = "budget" | "creative" | "targeting" | "bidding" | "channel" | "conversion";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  priority: Priority;
  category: Category;
  metric_before: string;
  metric_after: string;
  confidence: number;
  effort: "low" | "medium" | "high";
  status: "new" | "applied" | "dismissed";
  channel?: string;
  campaign?: string;
}

const priorityConfig: Record<Priority, { color: string; bg: string; label: string }> = {
  critical: { color: "text-danger", bg: "bg-danger/10 border-danger/20", label: "Critical" },
  high: { color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "High" },
  medium: { color: "text-accent-light", bg: "bg-accent/10 border-accent/20", label: "Medium" },
  low: { color: "text-muted-light", bg: "bg-white/5 border-card-border", label: "Low" },
};

const categoryConfig: Record<Category, { icon: string; label: string; color: string }> = {
  budget: { icon: "💰", label: "Budget", color: "text-success" },
  creative: { icon: "🎨", label: "Creative", color: "text-purple-400" },
  targeting: { icon: "🎯", label: "Targeting", color: "text-blue-400" },
  bidding: { icon: "📊", label: "Bidding", color: "text-amber-400" },
  channel: { icon: "📡", label: "Channel", color: "text-cyan-400" },
  conversion: { icon: "⚡", label: "Conversion", color: "text-emerald-400" },
};

function generateRecommendations(): Recommendation[] {
  return [
    {
      id: "rec_1",
      title: "Pause Display Remarketing campaign",
      description: "This campaign has had negative ROI for 14 consecutive days. ROAS is 0.6x with a CPA of $142, which is 3.2x above your target of $45. The audience overlap with Google Ads remarketing is 72%, meaning you're paying twice to reach the same users.",
      impact: "Save $4,200/month in wasted spend",
      priority: "critical",
      category: "budget",
      metric_before: "ROAS 0.6x",
      metric_after: "Reallocate to 3.8x ROAS channels",
      confidence: 94,
      effort: "low",
      status: "new",
      channel: "Display",
      campaign: "Display Remarketing",
    },
    {
      id: "rec_2",
      title: "Increase Google Ads budget by 25%",
      description: "Google Ads is your highest ROAS channel at 4.8x but is consistently hitting daily budget caps by 2pm. You're missing an estimated 340 clicks/day during peak conversion hours (2pm-6pm). Impression share lost to budget is 31%.",
      impact: "Estimated +87 conversions/month, $28,400 incremental revenue",
      priority: "critical",
      category: "budget",
      metric_before: "$34,200/mo spend, 487 conv",
      metric_after: "$42,750/mo spend, ~574 conv",
      confidence: 91,
      effort: "low",
      status: "new",
      channel: "Google Ads",
      campaign: "Multiple campaigns",
    },
    {
      id: "rec_3",
      title: "Refresh Video Testimonial creative",
      description: "Creative fatigue score is 87/100. CTR has dropped 62% from its peak 6 weeks ago (from 3.4% to 1.3%). Frequency is 8.2x on your retargeting audience. The same users have seen this ad too many times.",
      impact: "Restore CTR to ~2.5%, reduce CPA by ~30%",
      priority: "high",
      category: "creative",
      metric_before: "CTR 1.3%, CPA $78",
      metric_after: "CTR ~2.5%, CPA ~$55",
      confidence: 85,
      effort: "medium",
      status: "new",
      channel: "Meta Ads",
      campaign: "Q2 Retargeting",
    },
    {
      id: "rec_4",
      title: "Exclude high-overlap audiences on Meta",
      description: "Your 'Lookalike: Top 1%' and 'In-Market: SaaS Buyers' audiences have 34% overlap. You're bidding against yourself in Meta's auction, inflating CPMs by an estimated 18%. Use exclusion targeting to deduplicate.",
      impact: "Reduce CPM by ~18%, save $2,100/month",
      priority: "high",
      category: "targeting",
      metric_before: "CPM $12.40, 34% overlap",
      metric_after: "CPM ~$10.17, 0% overlap",
      confidence: 82,
      effort: "low",
      status: "new",
      channel: "Meta Ads",
    },
    {
      id: "rec_5",
      title: "Shift TikTok budget to weekday evenings",
      description: "Daypart analysis shows TikTok conversions are 3.2x higher between 6pm-10pm on weekdays vs. your current even distribution. CPA during peak hours is $22 vs $68 during off-hours. Enable dayparting to concentrate spend.",
      impact: "Reduce CPA from $41 to ~$28, +45% more conversions at same budget",
      priority: "high",
      category: "bidding",
      metric_before: "CPA $41, even distribution",
      metric_after: "CPA ~$28, peak-hour focus",
      confidence: 88,
      effort: "low",
      status: "new",
      channel: "TikTok Ads",
      campaign: "TikTok Viral Campaign",
    },
    {
      id: "rec_6",
      title: "Scale Email Nurture Series — most undervalued channel",
      description: "Attribution analysis reveals Email appears in 67% of high-value converting journeys but only receives 12% of last-touch credit. Data-driven attribution shows it deserves 20.1% of credit. Increasing email frequency from 2x/week to 3x/week could accelerate conversion paths.",
      impact: "Estimated +120 assisted conversions/month",
      priority: "high",
      category: "channel",
      metric_before: "12% last-touch credit, 2x/week",
      metric_after: "20.1% true credit, 3x/week",
      confidence: 79,
      effort: "medium",
      status: "new",
      channel: "Email",
      campaign: "Email Nurture Series",
    },
    {
      id: "rec_7",
      title: "Add checkout page micro-conversions",
      description: "Funnel analysis shows a 58% drop-off between 'Add to Cart' and 'Purchase'. Adding progress indicators and saving cart state could recover 15-20% of abandoned checkouts. Consider exit-intent popup with a 10% discount for first-time buyers.",
      impact: "Recover ~180 lost conversions/month worth $43,200",
      priority: "medium",
      category: "conversion",
      metric_before: "42% cart-to-purchase rate",
      metric_after: "~52% cart-to-purchase rate",
      confidence: 73,
      effort: "high",
      status: "new",
    },
    {
      id: "rec_8",
      title: "Test LinkedIn Conversation Ads for Enterprise ABM",
      description: "Your Enterprise ABM campaign on LinkedIn has a 0.8% CTR with standard Sponsored Content. Conversation Ads typically achieve 2-3x higher engagement for ABM campaigns. With your $12K/month LinkedIn budget, the expected lift in demo requests is significant.",
      impact: "+35% demo request rate for enterprise accounts",
      priority: "medium",
      category: "creative",
      metric_before: "CTR 0.8%, 12 demos/month",
      metric_after: "CTR ~2.1%, ~16 demos/month",
      confidence: 71,
      effort: "medium",
      status: "new",
      channel: "LinkedIn Ads",
      campaign: "Enterprise ABM",
    },
    {
      id: "rec_9",
      title: "Implement view-through attribution window change",
      description: "Your current 28-day view-through window is inflating Meta's contribution by an estimated 23%. Industry best practice for your conversion cycle (8.3 day average) is a 7-day window. This will give you more accurate attribution data.",
      impact: "More accurate channel allocation, better budget decisions",
      priority: "medium",
      category: "channel",
      metric_before: "28-day VTA window",
      metric_after: "7-day VTA window",
      confidence: 86,
      effort: "low",
      status: "new",
      channel: "Meta Ads",
    },
    {
      id: "rec_10",
      title: "Launch California geo-targeted campaign",
      description: "Geographic analysis shows California has your highest AOV ($312) and lowest CPA ($38) but only receives 8% of budget. Users from California convert at 2.1x the national average. Launching a dedicated geo-campaign could capture this high-intent market.",
      impact: "Estimated +$18,000 revenue/month at 5.2x ROAS",
      priority: "medium",
      category: "targeting",
      metric_before: "8% budget allocation to CA",
      metric_after: "15% budget allocation to CA",
      confidence: 77,
      effort: "medium",
      status: "new",
    },
  ];
}

export default function RecommendationsPage() {
  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setRecommendations(generateRecommendations());
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8"><div className="animate-pulse text-muted">Loading recommendations...</div></div>;

  const filtered = recommendations.filter(r => {
    if (filterPriority !== "all" && r.priority !== filterPriority) return false;
    if (filterCategory !== "all" && r.category !== filterCategory) return false;
    if (r.status === "dismissed") return false;
    return true;
  });

  const totalImpact = filtered.filter(r => r.status === "new").length;
  const criticalCount = recommendations.filter(r => r.priority === "critical" && r.status === "new").length;
  const appliedCount = recommendations.filter(r => r.status === "applied").length;

  const handleAction = (id: string, action: "applied" | "dismissed") => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  return (
    <div className="p-4 lg:p-8">
      <PageHeader
        title="AI Recommendations"
        subtitle="Data-driven action items to optimize your campaigns"
        actions={
          <div className="flex items-center gap-3">
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-lg px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                <span className="text-xs font-medium text-danger">{criticalCount} critical</span>
              </div>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <span className="text-sm text-muted">Active Recommendations</span>
          <p className="text-2xl font-bold text-text-primary mt-1">{totalImpact}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <span className="text-sm text-muted">Critical Actions</span>
          <p className="text-2xl font-bold text-danger mt-1">{criticalCount}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <span className="text-sm text-muted">Applied This Month</span>
          <p className="text-2xl font-bold text-success mt-1">{appliedCount}</p>
        </div>
        <div className="bg-card-bg border border-card-border rounded-xl p-5">
          <span className="text-sm text-muted">Avg. Confidence</span>
          <p className="text-2xl font-bold text-accent-light mt-1">
            {Math.round(filtered.reduce((s, r) => s + r.confidence, 0) / Math.max(filtered.length, 1))}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1 bg-card-bg border border-card-border rounded-lg p-1">
          {["all", "critical", "high", "medium", "low"].map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterPriority === p ? "bg-accent text-white" : "text-muted-light hover:text-text-primary"
              }`}
            >
              {p === "all" ? "All Priorities" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-card-bg border border-card-border rounded-lg p-1">
          {["all", "budget", "creative", "targeting", "bidding", "channel", "conversion"].map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterCategory === c ? "bg-accent text-white" : "text-muted-light hover:text-text-primary"
              }`}
            >
              {c === "all" ? "All" : categoryConfig[c as Category]?.label || c}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations list */}
      <div className="space-y-3">
        {filtered.map((rec) => {
          const pc = priorityConfig[rec.priority];
          const cc = categoryConfig[rec.category];
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className={`bg-card-bg border rounded-xl overflow-hidden transition-all duration-300 ${
                rec.status === "applied" ? "border-success/20 opacity-70" : `border-card-border hover:border-accent/20`
              }`}
            >
              <div
                className="flex items-start gap-4 p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : rec.id)}
              >
                {/* Priority indicator */}
                <div className={`w-1.5 h-12 rounded-full flex-shrink-0 mt-0.5 ${
                  rec.priority === "critical" ? "bg-danger" :
                  rec.priority === "high" ? "bg-warning" :
                  rec.priority === "medium" ? "bg-accent" : "bg-muted"
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{cc.icon}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${pc.bg} ${pc.color}`}>
                      {pc.label}
                    </span>
                    <span className="text-[10px] text-muted bg-white/5 px-2 py-0.5 rounded-full">{cc.label}</span>
                    {rec.channel && (
                      <span className="text-[10px] text-muted-light bg-white/5 px-2 py-0.5 rounded-full">{rec.channel}</span>
                    )}
                    {rec.status === "applied" && (
                      <span className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full font-medium">Applied</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{rec.title}</h3>
                  <p className="text-xs text-success font-medium">{rec.impact}</p>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-muted">Confidence</p>
                    <p className={`text-sm font-bold font-mono ${rec.confidence >= 85 ? "text-success" : rec.confidence >= 70 ? "text-warning" : "text-muted-light"}`}>
                      {rec.confidence}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted">Effort</p>
                    <p className={`text-xs font-medium ${rec.effort === "low" ? "text-success" : rec.effort === "medium" ? "text-warning" : "text-danger"}`}>
                      {rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)}
                    </p>
                  </div>
                  <svg className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-card-border/50 pt-4 ml-5">
                  <p className="text-sm text-muted-light leading-relaxed mb-4">{rec.description}</p>

                  <div className="flex items-center gap-6 mb-4">
                    <div className="bg-danger/5 border border-danger/10 rounded-lg px-4 py-2">
                      <p className="text-[10px] text-muted mb-0.5">Current</p>
                      <p className="text-xs font-mono text-danger">{rec.metric_before}</p>
                    </div>
                    <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                    <div className="bg-success/5 border border-success/10 rounded-lg px-4 py-2">
                      <p className="text-[10px] text-muted mb-0.5">Projected</p>
                      <p className="text-xs font-mono text-success">{rec.metric_after}</p>
                    </div>
                  </div>

                  {rec.campaign && (
                    <p className="text-xs text-muted mb-4">Campaign: <span className="text-muted-light">{rec.campaign}</span></p>
                  )}

                  {rec.status === "new" && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAction(rec.id, "applied"); }}
                        className="px-4 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/80 transition-all"
                      >
                        Mark as Applied
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAction(rec.id, "dismissed"); }}
                        className="px-4 py-2 text-muted-light text-xs border border-card-border rounded-lg hover:text-text-primary hover:border-accent/30 transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
