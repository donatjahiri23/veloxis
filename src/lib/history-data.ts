export interface PerformanceRow {
  id: string;
  date: string;
  campaign: string;
  ad_group: string;
  ad: string;
  channel: string;
  account: string;
  device: string;
  status: "active" | "paused" | "completed";
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cost: number;
  revenue: number;
  roas: number;
  cpc: number;
  cpa: number;
  bounce_rate: number;
  avg_session_duration: number;
}

export type ViewLevel = "campaign" | "ad_group" | "ad" | "device";

const campaigns = [
  "Summer Brand Push", "Q2 Retargeting", "Product Launch Wave", "Holiday Blitz",
  "Webinar Funnel", "Free Trial Drive", "Enterprise ABM", "Content Syndication",
  "Video Awareness", "Affiliate Growth", "SEO Content Sprint", "Email Nurture Series",
  "LinkedIn Thought Leadership", "TikTok Viral Campaign", "Display Remarketing",
];

const adGroupsByCampaign: Record<string, string[]> = {
  "Summer Brand Push": ["Brand - Broad", "Brand - Exact", "Brand - Competitors", "Brand - Display"],
  "Q2 Retargeting": ["Site Visitors 7d", "Site Visitors 30d", "Cart Abandoners", "Video Viewers"],
  "Product Launch Wave": ["Feature Highlights", "Pricing Focus", "Testimonials", "Comparison"],
  "Holiday Blitz": ["Black Friday", "Cyber Monday", "Holiday Gift Guide", "Year End Sale"],
  "Webinar Funnel": ["Top of Funnel", "Mid Funnel", "Bottom Funnel", "Retarget Registrants"],
  "Free Trial Drive": ["Trial - Search", "Trial - Display", "Trial - Social", "Trial - Lookalike"],
  "Enterprise ABM": ["Target Accounts T1", "Target Accounts T2", "Decision Makers", "Influencers"],
  "Content Syndication": ["Whitepapers", "Case Studies", "Blog Promotion", "Ebook Downloads"],
  "Video Awareness": ["15s Pre-roll", "30s Mid-roll", "Bumper Ads", "In-feed Video"],
  "Affiliate Growth": ["Top Publishers", "Niche Blogs", "Coupon Sites", "Review Sites"],
  "SEO Content Sprint": ["Pillar Pages", "Long-tail Keywords", "Featured Snippets", "Local SEO"],
  "Email Nurture Series": ["Welcome Series", "Product Education", "Re-engagement", "Upsell Flow"],
  "LinkedIn Thought Leadership": ["C-Suite Targeting", "Director Level", "IC Contributors", "Industry Groups"],
  "TikTok Viral Campaign": ["Trending Audio", "UGC Style", "Creator Collab", "Challenge Ads"],
  "Display Remarketing": ["Homepage Visitors", "Product Page Visitors", "Pricing Visitors", "Blog Readers"],
};

const adsByAdGroup: Record<string, string[]> = {};
const adFormats = ["Image", "Video", "Carousel", "Text"];
const adVariants = ["v1", "v2", "v3"];
const adThemes = ["Benefits", "Social Proof", "Urgency", "Value Prop", "CTA Focus", "Emotional"];

Object.values(adGroupsByCampaign).flat().forEach(ag => {
  adsByAdGroup[ag] = Array.from({ length: 3 }, (_, i) => {
    const format = adFormats[i % adFormats.length];
    const theme = adThemes[Math.floor(Math.random() * adThemes.length)];
    return `${ag} | ${format} - ${theme} ${adVariants[i]}`;
  });
});

const channels = ["Google Ads", "Meta Ads", "TikTok Ads", "Email", "Organic Search", "Direct", "LinkedIn Ads", "Display", "Affiliate", "YouTube"];
const accounts = ["Acme Corp", "TechStart Inc", "Global Media", "CloudBase", "Nextera Digital"];
const devices = ["Desktop", "Mobile", "Tablet"];
const statuses: PerformanceRow["status"][] = ["active", "paused", "completed"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function genId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export function generatePerformanceHistory(days: number = 90): PerformanceRow[] {
  const rows: PerformanceRow[] = [];
  const now = Date.now();

  for (let d = 0; d < days; d++) {
    const date = new Date(now - d * 86400000).toISOString().split("T")[0];
    const rowsPerDay = rand(8, 20);

    for (let r = 0; r < rowsPerDay; r++) {
      const campaign = pick(campaigns);
      const adGroups = adGroupsByCampaign[campaign] || ["Default Ad Group"];
      const ad_group = pick(adGroups);
      const ads = adsByAdGroup[ad_group] || [`${ad_group} | Default Ad`];
      const ad = pick(ads);

      const impressions = rand(500, 50000);
      const clicks = Math.round(impressions * (Math.random() * 0.06 + 0.005));
      const conversions = Math.round(clicks * (Math.random() * 0.1 + 0.005));
      const cost = Math.round(clicks * (Math.random() * 3 + 0.5) * 100) / 100;
      const revenue = Math.round(conversions * rand(30, 400));
      const ctr = +((clicks / impressions) * 100).toFixed(2);
      const roas = cost > 0 ? +(revenue / cost).toFixed(2) : 0;
      const cpc = clicks > 0 ? +(cost / clicks).toFixed(2) : 0;
      const cpa = conversions > 0 ? +(cost / conversions).toFixed(2) : 0;

      rows.push({
        id: `perf_${genId()}`,
        date,
        campaign,
        ad_group,
        ad,
        channel: pick(channels),
        account: pick(accounts),
        device: pick(devices),
        status: pick(statuses),
        impressions,
        clicks,
        ctr,
        conversions,
        cost,
        revenue,
        roas,
        cpc,
        cpa,
        bounce_rate: +(Math.random() * 40 + 20).toFixed(1),
        avg_session_duration: rand(30, 600),
      });
    }
  }

  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

export function getAdGroups(data: PerformanceRow[]): string[] {
  return [...new Set(data.map(r => r.ad_group))].sort();
}

export function getAds(data: PerformanceRow[]): string[] {
  return [...new Set(data.map(r => r.ad))].sort();
}

export const filterOptions = {
  campaigns,
  channels,
  accounts,
  devices,
  statuses: ["active", "paused", "completed"],
};
