import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST() {
  try {
    // 1. Channels
    const channelNames = [
      { name: "Google Ads", type: "paid" },
      { name: "Meta Ads", type: "paid" },
      { name: "LinkedIn Ads", type: "paid" },
      { name: "TikTok Ads", type: "paid" },
      { name: "Email", type: "owned" },
      { name: "Organic Search", type: "organic" },
      { name: "Direct", type: "organic" },
      { name: "Display", type: "paid" },
      { name: "Affiliate", type: "partner" },
      { name: "YouTube", type: "paid" },
    ];

    const { data: channels, error: chErr } = await supabase
      .from("channels")
      .upsert(channelNames, { onConflict: "name" })
      .select();
    if (chErr) throw new Error(`Channels: ${chErr.message}`);

    const channelMap: Record<string, number> = {};
    channels!.forEach((c: { name: string; id: number }) => { channelMap[c.name] = c.id; });

    // 2. Campaigns
    const campaignDefs = [
      { name: "Summer Brand Push", channel: "Google Ads", status: "active", budget: 45000, spent: 31200, impressions: 1420000, clicks: 42600, conversions: 1278, revenue: 148200 },
      { name: "Q2 Retargeting", channel: "Meta Ads", status: "active", budget: 28000, spent: 19600, impressions: 890000, clicks: 16020, conversions: 641, revenue: 72500 },
      { name: "Product Launch Wave", channel: "Google Ads", status: "active", budget: 62000, spent: 48200, impressions: 1850000, clicks: 55500, conversions: 1665, revenue: 183150 },
      { name: "Holiday Blitz", channel: "Meta Ads", status: "completed", budget: 35000, spent: 34800, impressions: 2100000, clicks: 37800, conversions: 378, revenue: 28350 },
      { name: "Webinar Funnel", channel: "LinkedIn Ads", status: "active", budget: 18000, spent: 12600, impressions: 320000, clicks: 6400, conversions: 384, revenue: 57600 },
      { name: "Free Trial Drive", channel: "Google Ads", status: "active", budget: 22000, spent: 15400, impressions: 680000, clicks: 23800, conversions: 714, revenue: 71400 },
      { name: "Enterprise ABM", channel: "LinkedIn Ads", status: "active", budget: 40000, spent: 28000, impressions: 180000, clicks: 3600, conversions: 216, revenue: 108000 },
      { name: "Content Syndication", channel: "Display", status: "paused", budget: 15000, spent: 12000, impressions: 950000, clicks: 9500, conversions: 67, revenue: 9380 },
      { name: "Video Awareness", channel: "YouTube", status: "active", budget: 30000, spent: 21000, impressions: 1600000, clicks: 32000, conversions: 320, revenue: 38400 },
      { name: "Affiliate Growth", channel: "Affiliate", status: "active", budget: 20000, spent: 14000, impressions: 520000, clicks: 15600, conversions: 624, revenue: 68640 },
      { name: "SEO Content Sprint", channel: "Organic Search", status: "active", budget: 8000, spent: 5600, impressions: 420000, clicks: 25200, conversions: 756, revenue: 60480 },
      { name: "Email Nurture Series", channel: "Email", status: "active", budget: 5000, spent: 3500, impressions: 180000, clicks: 14400, conversions: 864, revenue: 77760 },
      { name: "LinkedIn Thought Leadership", channel: "LinkedIn Ads", status: "active", budget: 25000, spent: 17500, impressions: 280000, clicks: 5600, conversions: 224, revenue: 44800 },
      { name: "TikTok Viral Campaign", channel: "TikTok Ads", status: "active", budget: 20000, spent: 14000, impressions: 3200000, clicks: 64000, conversions: 320, revenue: 19200 },
      { name: "Display Remarketing", channel: "Display", status: "active", budget: 12000, spent: 8400, impressions: 780000, clicks: 7800, conversions: 78, revenue: 5460 },
    ];

    const campaignRows = campaignDefs.map(c => ({
      name: c.name,
      channel_id: channelMap[c.channel],
      status: c.status,
      budget: c.budget,
      spent: c.spent,
      impressions: c.impressions,
      clicks: c.clicks,
      conversions: c.conversions,
      revenue: c.revenue,
      start_date: new Date(Date.now() - rand(30, 90) * 86400000).toISOString().split("T")[0],
      end_date: new Date(Date.now() + rand(7, 60) * 86400000).toISOString().split("T")[0],
    }));

    const { data: campaigns, error: campErr } = await supabase.from("campaigns").insert(campaignRows).select();
    if (campErr) throw new Error(`Campaigns: ${campErr.message}`);

    // 3. Ad Groups (4 per campaign)
    const adGroupDefs = [
      ["Broad Match Keywords", "Exact Match Brand", "Competitor Targeting", "Remarketing List"],
      ["Interest - Tech", "Lookalike 1%", "Retargeting 7d", "Custom Audience"],
      ["Decision Makers", "IT Managers", "C-Suite", "Mid-Market"],
      ["18-24 Demo", "25-34 Demo", "Trending Audio", "UGC Creators"],
    ];

    const adGroupRows: Array<Record<string, unknown>> = [];
    campaigns!.forEach((camp: { id: number; name: string }, i: number) => {
      const groupSet = adGroupDefs[i % adGroupDefs.length];
      groupSet.forEach(agName => {
        const impressions = rand(20000, 500000);
        const clicks = Math.round(impressions * (Math.random() * 0.04 + 0.008));
        const conversions = Math.round(clicks * (Math.random() * 0.06 + 0.01));
        const spend = Math.round(clicks * (Math.random() * 2 + 0.5));
        const revenue = Math.round(conversions * rand(50, 400));
        adGroupRows.push({
          name: agName,
          campaign_id: camp.id,
          status: pick(["active", "active", "active", "paused"]),
          impressions, clicks, conversions, spend, revenue,
        });
      });
    });

    const { data: adGroups, error: agErr } = await supabase.from("ad_groups").insert(adGroupRows).select();
    if (agErr) throw new Error(`Ad Groups: ${agErr.message}`);

    // 4. Ads (3 per ad group)
    const adFormats = ["image", "video", "carousel", "text"];
    const adRows: Array<Record<string, unknown>> = [];
    adGroups!.forEach((ag: { id: number; name: string }) => {
      for (let a = 0; a < 3; a++) {
        const impressions = rand(5000, 150000);
        const clicks = Math.round(impressions * (Math.random() * 0.05 + 0.005));
        const conversions = Math.round(clicks * (Math.random() * 0.06 + 0.005));
        const spend = Math.round(clicks * (Math.random() * 2 + 0.4));
        const revenue = Math.round(conversions * rand(40, 350));
        adRows.push({
          name: `${ag.name} - V${a + 1}`,
          ad_group_id: ag.id,
          format: pick(adFormats),
          status: pick(["active", "active", "paused"]),
          impressions, clicks, conversions, spend, revenue,
        });
      }
    });

    // Insert ads in batches of 50
    for (let i = 0; i < adRows.length; i += 50) {
      const batch = adRows.slice(i, i + 50);
      const { error } = await supabase.from("ads").insert(batch);
      if (error) throw new Error(`Ads batch ${i}: ${error.message}`);
    }

    // 5. Creatives
    const creativeDefs = [
      { name: "Video Testimonial - CEO", format: "video", duration: "30s" },
      { name: "Carousel - Product Features", format: "carousel", duration: null },
      { name: "Static - Social Proof Banner", format: "image", duration: null },
      { name: "UGC - Customer Story", format: "video", duration: "15s" },
      { name: "Animated - Free Trial CTA", format: "gif", duration: "6s" },
      { name: "Video - Product Demo", format: "video", duration: "60s" },
      { name: "Static - Competitor Comparison", format: "image", duration: null },
      { name: "Carousel - Case Studies", format: "carousel", duration: null },
      { name: "Video - How It Works", format: "video", duration: "45s" },
      { name: "Static - Limited Offer", format: "image", duration: null },
    ];

    const creativeRows = creativeDefs.map(c => {
      const impressions = rand(20000, 500000);
      const clicks = Math.round(impressions * (Math.random() * 0.05 + 0.008));
      const conversions = Math.round(clicks * (Math.random() * 0.08 + 0.01));
      const spend = Math.round(clicks * (Math.random() * 2 + 0.5));
      const revenue = Math.round(conversions * rand(50, 400));
      return {
        ...c,
        impressions, clicks, conversions, spend, revenue,
        video_views: c.format === "video" || c.format === "gif" ? Math.round(impressions * (Math.random() * 0.4 + 0.1)) : 0,
        completion_rate: c.format === "video" || c.format === "gif" ? +(Math.random() * 40 + 20).toFixed(1) : 0,
        fatigue_score: rand(10, 95),
      };
    });

    const { error: crErr } = await supabase.from("creatives").insert(creativeRows);
    if (crErr) throw new Error(`Creatives: ${crErr.message}`);

    // 6. Audience Segments
    const segmentNames = [
      "In-Market: SaaS Buyers", "Lookalike: Top 1%", "Retargeting: 7-day",
      "Custom: Enterprise IT", "Interest: Marketing Tech", "Lookalike: Top 5%",
      "Retargeting: Cart Abandon", "Custom: C-Suite", "In-Market: Cloud Services",
      "Interest: Business Software", "Retargeting: 30-day", "Custom: SMB Owners",
    ];

    const segmentRows = segmentNames.map(name => {
      const size = rand(50000, 5000000);
      const impressions = rand(20000, 800000);
      const clicks = Math.round(impressions * (Math.random() * 0.05 + 0.005));
      const conversions = Math.round(clicks * (Math.random() * 0.08 + 0.005));
      const spend = Math.round(clicks * (Math.random() * 2.5 + 0.8));
      const revenue = Math.round(conversions * rand(50, 450));
      return { name, size, impressions, clicks, conversions, spend, revenue, overlap_pct: +(Math.random() * 30 + 5).toFixed(1) };
    });

    const { error: segErr } = await supabase.from("audience_segments").insert(segmentRows);
    if (segErr) throw new Error(`Segments: ${segErr.message}`);

    // 7. Geo Performance
    const regions = [
      { region: "California", country: "US" }, { region: "New York", country: "US" },
      { region: "Texas", country: "US" }, { region: "London", country: "UK" },
      { region: "Ontario", country: "CA" }, { region: "Bavaria", country: "DE" },
      { region: "Ile-de-France", country: "FR" }, { region: "New South Wales", country: "AU" },
      { region: "Tokyo", country: "JP" }, { region: "Sao Paulo", country: "BR" },
      { region: "Florida", country: "US" }, { region: "Illinois", country: "US" },
    ];

    const geoRows = regions.map(r => {
      const impressions = rand(30000, 600000);
      const clicks = Math.round(impressions * (Math.random() * 0.04 + 0.008));
      const conversions = Math.round(clicks * (Math.random() * 0.07 + 0.01));
      const spend = Math.round(clicks * (Math.random() * 2 + 0.6));
      const revenue = Math.round(conversions * rand(40, 500));
      return { ...r, impressions, clicks, conversions, spend, revenue };
    });

    const { error: geoErr } = await supabase.from("geo_performance").insert(geoRows);
    if (geoErr) throw new Error(`Geo: ${geoErr.message}`);

    // 8. Daily Performance (90 days)
    const dailyRows: Array<Record<string, unknown>> = [];
    const now = Date.now();
    const devices = ["Desktop", "Mobile", "Tablet"];

    for (let d = 89; d >= 0; d--) {
      const date = new Date(now - d * 86400000).toISOString().split("T")[0];
      const dayOfWeek = new Date(now - d * 86400000).getDay();
      const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1;

      // One row per campaign per day (skip device granularity for volume)
      for (const camp of campaigns!.slice(0, 8)) {
        const device = pick(devices);
        const impressions = Math.round(rand(500, 15000) * weekendFactor);
        const clicks = Math.round(impressions * (Math.random() * 0.04 + 0.01));
        const conversions = Math.round(clicks * (Math.random() * 0.06 + 0.01));
        const spend = Math.round(clicks * (Math.random() * 2 + 0.5));
        const revenue = Math.round(conversions * rand(50, 300));

        dailyRows.push({
          date, campaign_id: camp.id, channel_id: camp.channel_id, device,
          impressions, clicks, conversions, spend, revenue,
          pageviews: Math.round(rand(200, 2000) * weekendFactor),
          sessions: Math.round(rand(100, 800) * weekendFactor),
          bounce_rate: +(Math.random() * 20 + 30).toFixed(1),
          avg_session_duration: rand(120, 400),
        });
      }
    }

    // Insert daily in batches
    for (let i = 0; i < dailyRows.length; i += 100) {
      const batch = dailyRows.slice(i, i + 100);
      const { error } = await supabase.from("daily_performance").insert(batch);
      if (error) throw new Error(`Daily batch ${i}: ${error.message}`);
    }

    // 9. Attribution Results
    const models = ["last_touch", "first_touch", "linear", "time_decay", "position_based", "data_driven"];
    const attrRows: Array<Record<string, unknown>> = [];
    const periodStart = new Date(now - 30 * 86400000).toISOString().split("T")[0];
    const periodEnd = new Date(now).toISOString().split("T")[0];

    for (const model of models) {
      for (const ch of channels!) {
        const conversions = rand(20, 500);
        const revenue = conversions * rand(50, 400);
        attrRows.push({
          channel_id: ch.id,
          model,
          attributed_conversions: conversions,
          attributed_revenue: revenue,
          weight_pct: +(Math.random() * 25 + 3).toFixed(1),
          period_start: periodStart,
          period_end: periodEnd,
        });
      }
    }

    const { error: attrErr } = await supabase.from("attribution_results").insert(attrRows);
    if (attrErr) throw new Error(`Attribution: ${attrErr.message}`);

    return NextResponse.json({
      success: true,
      counts: {
        channels: channels!.length,
        campaigns: campaigns!.length,
        ad_groups: adGroups!.length,
        ads: adRows.length,
        creatives: creativeRows.length,
        segments: segmentRows.length,
        geo_regions: geoRows.length,
        daily_rows: dailyRows.length,
        attribution_rows: attrRows.length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Seed error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
