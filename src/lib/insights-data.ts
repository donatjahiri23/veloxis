function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateFunnelData() {
  const impressions = rand(1800000, 2500000);
  const clicks = Math.round(impressions * (Math.random() * 0.03 + 0.015));
  const landing = Math.round(clicks * (Math.random() * 0.15 + 0.75));
  const engaged = Math.round(landing * (Math.random() * 0.2 + 0.35));
  const leads = Math.round(engaged * (Math.random() * 0.15 + 0.2));
  const conversions = Math.round(leads * (Math.random() * 0.15 + 0.15));

  return [
    { stage: "Impressions", value: impressions, rate: 100 },
    { stage: "Clicks", value: clicks, rate: +((clicks / impressions) * 100).toFixed(2) },
    { stage: "Landing Page", value: landing, rate: +((landing / clicks) * 100).toFixed(2) },
    { stage: "Engaged", value: engaged, rate: +((engaged / landing) * 100).toFixed(2) },
    { stage: "Leads", value: leads, rate: +((leads / engaged) * 100).toFixed(2) },
    { stage: "Conversions", value: conversions, rate: +((conversions / leads) * 100).toFixed(2) },
  ];
}

export function generateCostTrendData(days: number = 30) {
  const data = [];
  const now = Date.now();
  let cumulativeSpend = 0;
  let cumulativeRevenue = 0;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000).toISOString().split("T")[0];
    const dayOfWeek = new Date(now - i * 86400000).getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1;
    const dailySpend = Math.round(rand(800, 3500) * weekendFactor);
    const dailyRevenue = Math.round(dailySpend * (Math.random() * 2.5 + 1.5));
    cumulativeSpend += dailySpend;
    cumulativeRevenue += dailyRevenue;

    data.push({
      date,
      daily_spend: dailySpend,
      daily_revenue: dailyRevenue,
      daily_roas: +(dailyRevenue / dailySpend).toFixed(2),
      cumulative_spend: cumulativeSpend,
      cumulative_revenue: cumulativeRevenue,
      cumulative_roas: +(cumulativeRevenue / cumulativeSpend).toFixed(2),
      cpa: +(dailySpend / Math.max(rand(5, 30) * weekendFactor, 1)).toFixed(2),
      cpl: +(dailySpend / Math.max(rand(15, 80) * weekendFactor, 1)).toFixed(2),
    });
  }
  return data;
}

export function generateCreativePerformance() {
  const creatives = [
    { name: "Video Testimonial - CEO", format: "Video", duration: "30s" },
    { name: "Carousel - Product Features", format: "Carousel", duration: "-" },
    { name: "Static - Social Proof Banner", format: "Image", duration: "-" },
    { name: "UGC - Customer Story", format: "Video", duration: "15s" },
    { name: "Animated - Free Trial CTA", format: "GIF", duration: "6s" },
    { name: "Video - Product Demo", format: "Video", duration: "60s" },
    { name: "Static - Competitor Comparison", format: "Image", duration: "-" },
    { name: "Carousel - Case Studies", format: "Carousel", duration: "-" },
    { name: "Video - How It Works", format: "Video", duration: "45s" },
    { name: "Static - Limited Offer", format: "Image", duration: "-" },
  ];

  return creatives.map(c => {
    const impressions = rand(20000, 500000);
    const clicks = Math.round(impressions * (Math.random() * 0.05 + 0.008));
    const conversions = Math.round(clicks * (Math.random() * 0.08 + 0.01));
    const spend = Math.round(clicks * (Math.random() * 2 + 0.5));
    const revenue = Math.round(conversions * rand(50, 400));
    const videoViews = c.format === "Video" || c.format === "GIF" ? Math.round(impressions * (Math.random() * 0.4 + 0.1)) : 0;

    return {
      ...c,
      impressions,
      clicks,
      ctr: +((clicks / impressions) * 100).toFixed(2),
      conversions,
      spend,
      revenue,
      roas: +(revenue / Math.max(spend, 1)).toFixed(2),
      cpa: conversions > 0 ? +(spend / conversions).toFixed(2) : 0,
      video_views: videoViews,
      completion_rate: c.format === "Video" || c.format === "GIF" ? +(Math.random() * 40 + 20).toFixed(1) : 0,
      fatigue_score: rand(10, 95),
    };
  }).sort((a, b) => b.roas - a.roas);
}

export function generateDaypartData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const data: { day: string; hour: number; conversions: number; cpa: number; roas: number }[] = [];

  days.forEach(day => {
    hours.forEach(hour => {
      const isWeekend = day === "Sat" || day === "Sun";
      const isPeak = hour >= 9 && hour <= 17;
      const isEvening = hour >= 18 && hour <= 22;
      const baseFactor = isPeak ? 2.5 : isEvening ? 1.8 : 0.4;
      const weekendFactor = isWeekend ? 0.6 : 1;
      const conversions = Math.round(rand(0, 8) * baseFactor * weekendFactor);
      const spend = rand(10, 80) * baseFactor * weekendFactor;

      data.push({
        day,
        hour,
        conversions,
        cpa: conversions > 0 ? +(spend / conversions).toFixed(2) : 999,
        roas: +(conversions * rand(40, 200) / Math.max(spend, 1)).toFixed(2),
      });
    });
  });

  return data;
}

export function generateAudienceSegments() {
  const segments = [
    "In-Market: SaaS Buyers", "Lookalike: Top 1%", "Retargeting: 7-day",
    "Custom: Enterprise IT", "Interest: Marketing Tech", "Lookalike: Top 5%",
    "Retargeting: Cart Abandon", "Custom: C-Suite", "In-Market: Cloud Services",
    "Interest: Business Software", "Retargeting: 30-day", "Custom: SMB Owners",
  ];

  return segments.map(name => {
    const size = rand(50000, 5000000);
    const impressions = rand(20000, 800000);
    const clicks = Math.round(impressions * (Math.random() * 0.05 + 0.005));
    const conversions = Math.round(clicks * (Math.random() * 0.08 + 0.005));
    const spend = Math.round(clicks * (Math.random() * 2.5 + 0.8));
    const revenue = Math.round(conversions * rand(50, 450));

    return {
      name,
      size,
      impressions,
      clicks,
      ctr: +((clicks / impressions) * 100).toFixed(2),
      conversions,
      conversion_rate: +((conversions / Math.max(clicks, 1)) * 100).toFixed(2),
      spend,
      revenue,
      roas: +(revenue / Math.max(spend, 1)).toFixed(2),
      cpa: conversions > 0 ? +(spend / conversions).toFixed(2) : 0,
      overlap: +(Math.random() * 30 + 5).toFixed(1),
    };
  }).sort((a, b) => b.roas - a.roas);
}

export function generateGeoPerformance() {
  const regions = [
    { region: "California", country: "US" }, { region: "New York", country: "US" },
    { region: "Texas", country: "US" }, { region: "London", country: "UK" },
    { region: "Ontario", country: "CA" }, { region: "Bavaria", country: "DE" },
    { region: "Ile-de-France", country: "FR" }, { region: "New South Wales", country: "AU" },
    { region: "Tokyo", country: "JP" }, { region: "Sao Paulo", country: "BR" },
    { region: "Florida", country: "US" }, { region: "Illinois", country: "US" },
    { region: "British Columbia", country: "CA" }, { region: "North Holland", country: "NL" },
    { region: "Maharashtra", country: "IN" },
  ];

  return regions.map(r => {
    const impressions = rand(30000, 600000);
    const clicks = Math.round(impressions * (Math.random() * 0.04 + 0.008));
    const conversions = Math.round(clicks * (Math.random() * 0.07 + 0.01));
    const spend = Math.round(clicks * (Math.random() * 2 + 0.6));
    const revenue = Math.round(conversions * rand(40, 500));

    return {
      ...r,
      impressions,
      clicks,
      ctr: +((clicks / impressions) * 100).toFixed(2),
      conversions,
      spend,
      revenue,
      roas: +(revenue / Math.max(spend, 1)).toFixed(2),
      cpa: conversions > 0 ? +(spend / conversions).toFixed(2) : 0,
      avg_order_value: conversions > 0 ? +(revenue / conversions).toFixed(0) : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

export function generateBudgetPacing() {
  const channels = ["Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads", "Display", "YouTube"];
  return channels.map(channel => {
    const budget = rand(10000, 60000);
    const daysInMonth = 30;
    const daysPassed = rand(10, 25);
    const spent = Math.round(budget * (daysPassed / daysInMonth) * (Math.random() * 0.4 + 0.8));
    const projected = Math.round(spent / daysPassed * daysInMonth);
    const pace = +((spent / (budget * daysPassed / daysInMonth)) * 100).toFixed(1);

    return {
      channel,
      budget,
      spent,
      remaining: budget - spent,
      days_remaining: daysInMonth - daysPassed,
      projected_spend: projected,
      pace,
      on_track: pace >= 90 && pace <= 110,
      over_budget: projected > budget * 1.05,
    };
  });
}
