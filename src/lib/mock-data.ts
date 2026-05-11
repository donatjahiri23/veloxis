export interface TouchPoint {
  id: string;
  channel: string;
  campaign: string;
  creative: string;
  timestamp: number;
  type: "click" | "impression" | "view" | "visit" | "conversion";
  device: string;
  resolved_id: string;
  anonymous_id: string;
  page_url?: string;
  referrer?: string;
  value?: number;
}

export interface UserJourney {
  resolved_id: string;
  touchpoints: TouchPoint[];
  devices: string[];
  sessions: number;
  converted: boolean;
  conversion_value: number;
  first_seen: string;
  last_seen: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  status: "active" | "paused" | "completed";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
  start_date: string;
  end_date: string;
}

export interface AttributionResult {
  channel: string;
  last_touch: number;
  first_touch: number;
  linear: number;
  time_decay: number;
  position_based: number;
  data_driven: number;
  conversions: number;
  revenue: number;
}

export interface LiveEvent {
  id: string;
  type: "pageview" | "click" | "conversion" | "impression" | "video_view" | "scroll" | "form_submit";
  anonymous_id: string;
  resolved_id: string | null;
  timestamp: number;
  page_url: string;
  channel: string;
  device: string;
  country: string;
  city: string;
  value?: number;
  metadata?: Record<string, string>;
}

const channels = ["Google Ads", "Meta Ads", "TikTok Ads", "Email", "Organic Search", "Direct", "LinkedIn Ads", "Display", "Affiliate", "YouTube"];
const devices = ["Desktop", "Mobile", "Tablet"];
const countries = ["US", "UK", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "NL"];
const cities = ["New York", "London", "Berlin", "Paris", "Toronto", "Sydney", "Tokyo", "Sao Paulo", "Mumbai", "Amsterdam"];
const pages = ["/", "/pricing", "/features", "/blog/roi-guide", "/demo", "/case-studies", "/about", "/contact", "/signup", "/checkout"];
const creatives = ["Brand Awareness Q2", "Retargeting Carousel", "Video Testimonial", "Product Demo", "Holiday Sale", "Free Trial CTA", "Webinar Invite", "Case Study Ad", "Competitor Comparison", "Social Proof Banner"];
const campaignNames = [
  "Summer Brand Push", "Q2 Retargeting", "Product Launch Wave", "Holiday Blitz",
  "Webinar Funnel", "Free Trial Drive", "Enterprise ABM", "Content Syndication",
  "Video Awareness", "Affiliate Growth", "SEO Content Sprint", "Email Nurture Series",
  "LinkedIn Thought Leadership", "TikTok Viral Campaign", "Display Remarketing"
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function generateTimeSeriesData(days: number = 30) {
  const data = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    const dayOfWeek = date.getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;
    const trendFactor = 1 + (days - i) * 0.008;
    data.push({
      date: date.toISOString().split("T")[0],
      pageviews: Math.round(rand(8000, 15000) * weekendFactor * trendFactor),
      sessions: Math.round(rand(3000, 7000) * weekendFactor * trendFactor),
      conversions: Math.round(rand(40, 120) * weekendFactor * trendFactor),
      revenue: Math.round(rand(4000, 18000) * weekendFactor * trendFactor),
      bounceRate: +(Math.random() * 20 + 30).toFixed(1),
      avgSessionDuration: rand(120, 400),
    });
  }
  return data;
}

export function generateCampaigns(count: number = 15): Campaign[] {
  return Array.from({ length: count }, (_, i) => {
    const budget = rand(5000, 80000);
    const spent = Math.round(budget * (Math.random() * 0.6 + 0.3));
    const impressions = rand(50000, 2000000);
    const clicks = Math.round(impressions * (Math.random() * 0.04 + 0.005));
    const conversions = Math.round(clicks * (Math.random() * 0.08 + 0.01));
    const revenue = Math.round(conversions * rand(50, 500));
    return {
      id: `camp_${genId()}`,
      name: campaignNames[i % campaignNames.length],
      channel: pick(channels.slice(0, 8)),
      status: pick(["active", "active", "active", "paused", "completed"]) as Campaign["status"],
      budget,
      spent,
      impressions,
      clicks,
      conversions,
      revenue,
      ctr: +((clicks / impressions) * 100).toFixed(2),
      cpc: +(spent / clicks).toFixed(2),
      roas: +(revenue / spent).toFixed(2),
      start_date: new Date(Date.now() - rand(7, 90) * 86400000).toISOString().split("T")[0],
      end_date: new Date(Date.now() + rand(7, 60) * 86400000).toISOString().split("T")[0],
    };
  });
}

export function generateAttributionData(): AttributionResult[] {
  return channels.map(channel => {
    const conversions = rand(20, 500);
    const revenue = conversions * rand(50, 400);
    const total = rand(100, 1000);
    return {
      channel,
      last_touch: +(Math.random() * 30 + 2).toFixed(1),
      first_touch: +(Math.random() * 30 + 2).toFixed(1),
      linear: +(Math.random() * 25 + 3).toFixed(1),
      time_decay: +(Math.random() * 28 + 2).toFixed(1),
      position_based: +(Math.random() * 27 + 3).toFixed(1),
      data_driven: +(Math.random() * 25 + 4).toFixed(1),
      conversions,
      revenue,
    };
  });
}

export function generateUserJourneys(count: number = 50): UserJourney[] {
  return Array.from({ length: count }, () => {
    const touchpointCount = rand(2, 12);
    const resolved_id = `uid_${genId()}`;
    const deviceSet = Array.from({ length: rand(1, 3) }, () => pick(devices));
    const uniqueDevices = [...new Set(deviceSet)];
    const converted = Math.random() > 0.4;
    const now = Date.now();

    const touchpoints: TouchPoint[] = Array.from({ length: touchpointCount }, (_, j) => ({
      id: `tp_${genId()}`,
      channel: pick(channels),
      campaign: pick(campaignNames),
      creative: pick(creatives),
      timestamp: now - (touchpointCount - j) * rand(3600000, 86400000),
      type: j === touchpointCount - 1 && converted ? "conversion" : pick(["click", "impression", "view", "visit"]) as TouchPoint["type"],
      device: pick(uniqueDevices),
      resolved_id,
      anonymous_id: `anon_${genId()}`,
      page_url: pick(pages),
      value: j === touchpointCount - 1 && converted ? rand(50, 500) : undefined,
    }));

    return {
      resolved_id,
      touchpoints,
      devices: uniqueDevices,
      sessions: rand(2, touchpointCount),
      converted,
      conversion_value: converted ? touchpoints[touchpoints.length - 1].value || 0 : 0,
      first_seen: new Date(touchpoints[0].timestamp).toISOString(),
      last_seen: new Date(touchpoints[touchpoints.length - 1].timestamp).toISOString(),
    };
  });
}

export function generateLiveEvent(): LiveEvent {
  const types: LiveEvent["type"][] = ["pageview", "pageview", "pageview", "click", "click", "conversion", "impression", "video_view", "scroll", "form_submit"];
  const type = pick(types);
  const countryIdx = rand(0, countries.length - 1);

  return {
    id: `evt_${genId()}`,
    type,
    anonymous_id: `anon_${genId()}`,
    resolved_id: Math.random() > 0.4 ? `uid_${genId()}` : null,
    timestamp: Date.now(),
    page_url: pick(pages),
    channel: pick(channels),
    device: pick(devices),
    country: countries[countryIdx],
    city: cities[countryIdx],
    value: type === "conversion" ? rand(20, 600) : undefined,
    metadata: type === "video_view" ? { duration: `${rand(5, 180)}s`, completion: `${rand(10, 100)}%` } : undefined,
  };
}

export function generateChannelBreakdown() {
  return channels.map(channel => ({
    channel,
    sessions: rand(500, 15000),
    conversions: rand(10, 400),
    revenue: rand(2000, 80000),
    bounce_rate: +(Math.random() * 30 + 20).toFixed(1),
    avg_duration: rand(60, 450),
    new_users: rand(200, 8000),
  }));
}

export function generateHourlyData() {
  return Array.from({ length: 24 }, (_, hour) => {
    const peakFactor = hour >= 9 && hour <= 17 ? 1.5 : hour >= 18 && hour <= 22 ? 1.2 : 0.5;
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      events: Math.round(rand(200, 800) * peakFactor),
      conversions: Math.round(rand(2, 15) * peakFactor),
      revenue: Math.round(rand(200, 2000) * peakFactor),
    };
  });
}

export const kpiMetrics = {
  totalEvents: { value: 2847293, change: 12.4, label: "Total Events" },
  uniqueUsers: { value: 184529, change: 8.7, label: "Unique Users" },
  conversions: { value: 3247, change: 15.2, label: "Conversions" },
  revenue: { value: 487320, change: 11.8, label: "Revenue" },
  identityResolution: { value: 78.4, change: 3.2, label: "ID Resolution Rate" },
  avgTouchpoints: { value: 4.7, change: -2.1, label: "Avg. Touchpoints" },
  crossDevice: { value: 34.8, change: 5.6, label: "Cross-Device %" },
  roas: { value: 4.2, change: 0.8, label: "Overall ROAS" },
};
