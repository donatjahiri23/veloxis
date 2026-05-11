export function generateAiContextSnapshot(): string {
  const campaigns = [
    { name: "Summer Brand Push", channel: "Google Ads", status: "active", budget: 45000, spent: 31200, impressions: 1420000, clicks: 42600, conversions: 1278, revenue: 148200, ctr: 3.0, cpc: 0.73, roas: 4.75 },
    { name: "Q2 Retargeting", channel: "Meta Ads", status: "active", budget: 28000, spent: 19600, impressions: 890000, clicks: 16020, conversions: 641, revenue: 72500, ctr: 1.8, cpc: 1.22, roas: 3.7 },
    { name: "Product Launch Wave", channel: "Google Ads", status: "active", budget: 62000, spent: 48200, impressions: 1850000, clicks: 55500, conversions: 1665, revenue: 183150, ctr: 3.0, cpc: 0.87, roas: 3.8 },
    { name: "Holiday Blitz", channel: "Meta Ads", status: "completed", budget: 35000, spent: 34800, impressions: 2100000, clicks: 37800, conversions: 378, revenue: 28350, ctr: 1.8, cpc: 0.92, roas: 0.81 },
    { name: "Webinar Funnel", channel: "LinkedIn Ads", status: "active", budget: 18000, spent: 12600, impressions: 320000, clicks: 6400, conversions: 384, revenue: 57600, ctr: 2.0, cpc: 1.97, roas: 4.57 },
    { name: "Free Trial Drive", channel: "Google Ads", status: "active", budget: 22000, spent: 15400, impressions: 680000, clicks: 23800, conversions: 714, revenue: 71400, ctr: 3.5, cpc: 0.65, roas: 4.64 },
    { name: "Enterprise ABM", channel: "LinkedIn Ads", status: "active", budget: 40000, spent: 28000, impressions: 180000, clicks: 3600, conversions: 216, revenue: 108000, ctr: 2.0, cpc: 7.78, roas: 3.86 },
    { name: "Content Syndication", channel: "Display", status: "paused", budget: 15000, spent: 12000, impressions: 950000, clicks: 9500, conversions: 67, revenue: 9380, ctr: 1.0, cpc: 1.26, roas: 0.78 },
    { name: "Video Awareness", channel: "YouTube", status: "active", budget: 30000, spent: 21000, impressions: 1600000, clicks: 32000, conversions: 320, revenue: 38400, ctr: 2.0, cpc: 0.66, roas: 1.83 },
    { name: "Affiliate Growth", channel: "Affiliate", status: "active", budget: 20000, spent: 14000, impressions: 520000, clicks: 15600, conversions: 624, revenue: 68640, ctr: 3.0, cpc: 0.9, roas: 4.9 },
    { name: "SEO Content Sprint", channel: "Organic Search", status: "active", budget: 8000, spent: 5600, impressions: 420000, clicks: 25200, conversions: 756, revenue: 60480, ctr: 6.0, cpc: 0.22, roas: 10.8 },
    { name: "Email Nurture Series", channel: "Email", status: "active", budget: 5000, spent: 3500, impressions: 180000, clicks: 14400, conversions: 864, revenue: 77760, ctr: 8.0, cpc: 0.24, roas: 22.2 },
    { name: "LinkedIn Thought Leadership", channel: "LinkedIn Ads", status: "active", budget: 25000, spent: 17500, impressions: 280000, clicks: 5600, conversions: 224, revenue: 44800, ctr: 2.0, cpc: 3.13, roas: 2.56 },
    { name: "TikTok Viral Campaign", channel: "TikTok Ads", status: "active", budget: 20000, spent: 14000, impressions: 3200000, clicks: 64000, conversions: 320, revenue: 19200, ctr: 2.0, cpc: 0.22, roas: 1.37 },
    { name: "Display Remarketing", channel: "Display", status: "active", budget: 12000, spent: 8400, impressions: 780000, clicks: 7800, conversions: 78, revenue: 5460, ctr: 1.0, cpc: 1.08, roas: 0.65 },
  ];

  const channelSummary = [
    { channel: "Google Ads", spend: 94800, revenue: 402750, conversions: 3657, roas: 4.25, cpa: 25.93 },
    { channel: "Meta Ads", spend: 54400, revenue: 100850, conversions: 1019, roas: 1.85, cpa: 53.39 },
    { channel: "LinkedIn Ads", spend: 58100, revenue: 210400, conversions: 824, roas: 3.62, cpa: 70.51 },
    { channel: "Email", spend: 3500, revenue: 77760, conversions: 864, roas: 22.2, cpa: 4.05 },
    { channel: "Organic Search", spend: 5600, revenue: 60480, conversions: 756, roas: 10.8, cpa: 7.41 },
    { channel: "YouTube", spend: 21000, revenue: 38400, conversions: 320, roas: 1.83, cpa: 65.63 },
    { channel: "TikTok Ads", spend: 14000, revenue: 19200, conversions: 320, roas: 1.37, cpa: 43.75 },
    { channel: "Display", spend: 20400, revenue: 14840, conversions: 145, roas: 0.73, cpa: 140.69 },
    { channel: "Affiliate", spend: 14000, revenue: 68640, conversions: 624, roas: 4.9, cpa: 22.44 },
    { channel: "Direct", spend: 0, revenue: 52100, conversions: 412, roas: 0, cpa: 0 },
  ];

  const kpis = {
    totalEvents: "2,847,293 (+12.4%)",
    uniqueUsers: "184,529 (+8.7%)",
    totalConversions: "3,247 (+15.2%)",
    totalRevenue: "$487,320 (+11.8%)",
    idResolutionRate: "78.4% (+3.2%)",
    avgTouchpointsToConvert: "4.7 (-2.1%)",
    crossDeviceRate: "34.8% (+5.6%)",
    overallROAS: "4.2x (+0.8%)",
    avgConversionTime: "8.3 days",
    totalAdSpend: "$285,800",
    blendedCPA: "$47.20",
    blendedCTR: "2.8%",
  };

  const attribution = {
    note: "Revenue attribution varies by model. Data-Driven (Shapley) is recommended.",
    byModel: {
      lastTouch: { topChannel: "Google Ads (34%)", undervalued: "Email (8%)", overvalued: "Direct (22%)" },
      firstTouch: { topChannel: "Google Ads (28%)", undervalued: "Display (4%)", overvalued: "Organic Search (19%)" },
      dataDriven: { topChannel: "Google Ads (29%)", undervalued: "none — balanced", overvalued: "Direct (11%)" },
    },
    insight: "Email is undervalued by 58% under Last Touch. It assists 67% of high-value conversions but rarely gets last-click credit. Data-Driven model reveals Email's true contribution.",
  };

  const identity = {
    totalResolved: "184,529 unique users from 2.8M anonymous touchpoints",
    crossDevice: "34.8% identified across 2+ devices",
    crossDevicePaths: "Desktop → Mobile: 48%, Mobile → Desktop: 31%, Tablet → Desktop: 12%, Three+ devices: 9%",
    conversionLift: "Cross-device users convert at 2.3x the rate of single-device users",
    avgPathLength: "4.7 touchpoints across 2.3 devices",
  };

  const funnel = {
    impressions: "2,100,000 (100%)",
    clicks: "52,500 (2.5% CTR)",
    landingPage: "44,625 (85% of clicks)",
    engaged: "20,081 (45% engaged)",
    leads: "5,621 (28% lead rate)",
    conversions: "3,247 (57.8% of leads → conversion)",
  };

  const topCreatives = [
    { name: "Video Testimonial - CEO", format: "Video 30s", roas: 5.2, fatigueScore: 32 },
    { name: "Carousel - Product Features", format: "Carousel", roas: 4.1, fatigueScore: 45 },
    { name: "UGC - Customer Story", format: "Video 15s", roas: 3.8, fatigueScore: 28 },
    { name: "Static - Social Proof Banner", format: "Image", roas: 2.9, fatigueScore: 67 },
    { name: "Animated - Free Trial CTA", format: "GIF 6s", roas: 2.4, fatigueScore: 78 },
    { name: "Static - Limited Offer", format: "Image", roas: 1.2, fatigueScore: 87 },
  ];

  const audienceSegments = [
    { name: "In-Market: SaaS Buyers", roas: 6.2, cpa: 28, overlapPct: 12 },
    { name: "Lookalike: Top 1%", roas: 5.1, cpa: 35, overlapPct: 8 },
    { name: "Retargeting: Cart Abandon", roas: 4.8, cpa: 22, overlapPct: 15 },
    { name: "Custom: Enterprise IT", roas: 4.2, cpa: 62, overlapPct: 18 },
    { name: "Interest: Marketing Tech", roas: 3.4, cpa: 41, overlapPct: 24 },
    { name: "Retargeting: 7-day", roas: 3.1, cpa: 38, overlapPct: 32 },
    { name: "Lookalike: Top 5%", roas: 2.3, cpa: 55, overlapPct: 28 },
    { name: "Custom: C-Suite", roas: 1.9, cpa: 89, overlapPct: 11 },
  ];

  const budgetPacing = [
    { channel: "Google Ads", budget: 45000, spent: 31200, pace: "104%", projected: "$46,800", onTrack: true },
    { channel: "Meta Ads", budget: 28000, spent: 19600, pace: "92%", projected: "$25,760", onTrack: true },
    { channel: "LinkedIn Ads", budget: 25000, spent: 17500, pace: "108%", projected: "$27,000", overBudget: true },
    { channel: "TikTok Ads", budget: 20000, spent: 14000, pace: "98%", projected: "$19,600", onTrack: true },
    { channel: "Display", budget: 12000, spent: 8400, pace: "88%", projected: "$10,560", underSpending: true },
    { channel: "YouTube", budget: 30000, spent: 21000, pace: "101%", projected: "$30,300", onTrack: true },
  ];

  return `
=== PLATFORM DATA SNAPSHOT (Current Period: Last 30 Days) ===

## KPI Summary
${Object.entries(kpis).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

## Campaign Performance (15 campaigns)
${campaigns.map(c => `- ${c.name} [${c.channel}] ${c.status.toUpperCase()} | Budget: $${c.budget.toLocaleString()} | Spent: $${c.spent.toLocaleString()} | Conv: ${c.conversions} | Revenue: $${c.revenue.toLocaleString()} | ROAS: ${c.roas}x | CTR: ${c.ctr}% | CPC: $${c.cpc}`).join("\n")}

## Channel Summary
${channelSummary.map(c => `- ${c.channel}: Spend $${c.spend.toLocaleString()} | Revenue $${c.revenue.toLocaleString()} | Conv: ${c.conversions} | ROAS: ${c.roas}x | CPA: $${c.cpa}`).join("\n")}

## Attribution Insights
- ${attribution.note}
- Last Touch: Top=${attribution.byModel.lastTouch.topChannel}, Undervalued=${attribution.byModel.lastTouch.undervalued}, Overvalued=${attribution.byModel.lastTouch.overvalued}
- First Touch: Top=${attribution.byModel.firstTouch.topChannel}, Undervalued=${attribution.byModel.firstTouch.undervalued}, Overvalued=${attribution.byModel.firstTouch.overvalued}
- Data-Driven: Top=${attribution.byModel.dataDriven.topChannel}, Undervalued=${attribution.byModel.dataDriven.undervalued}, Overvalued=${attribution.byModel.dataDriven.overvalued}
- Key insight: ${attribution.insight}

## Identity Resolution
- ${identity.totalResolved}
- Cross-device rate: ${identity.crossDevice}
- Paths: ${identity.crossDevicePaths}
- ${identity.conversionLift}
- ${identity.avgPathLength}

## Conversion Funnel
- Impressions: ${funnel.impressions}
- Clicks: ${funnel.clicks}
- Landing Page: ${funnel.landingPage}
- Engaged: ${funnel.engaged}
- Leads: ${funnel.leads}
- Conversions: ${funnel.conversions}

## Top Creatives (by ROAS)
${topCreatives.map(c => `- ${c.name} (${c.format}): ROAS ${c.roas}x | Fatigue: ${c.fatigueScore}/100`).join("\n")}

## Audience Segments (by ROAS)
${audienceSegments.map(s => `- ${s.name}: ROAS ${s.roas}x | CPA $${s.cpa} | Overlap ${s.overlapPct}%`).join("\n")}

## Budget Pacing (Monthly)
${budgetPacing.map(b => `- ${b.channel}: Budget $${b.budget.toLocaleString()} | Spent $${b.spent.toLocaleString()} | Pace ${b.pace} | Projected ${b.projected}${b.onTrack ? "" : b.overBudget ? " ⚠️ OVER BUDGET" : " ⚠️ UNDERSPENDING"}`).join("\n")}
`;
}
