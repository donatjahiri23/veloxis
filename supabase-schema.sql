-- Veloxis Marketing Intelligence Platform - Database Schema

-- Channels
CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  channel_id INT REFERENCES channels(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  budget NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  ctr NUMERIC(5,2) GENERATED ALWAYS AS (CASE WHEN impressions > 0 THEN (clicks::NUMERIC / impressions) * 100 ELSE 0 END) STORED,
  cpc NUMERIC(8,2) GENERATED ALWAYS AS (CASE WHEN clicks > 0 THEN spent / clicks ELSE 0 END) STORED,
  roas NUMERIC(8,2) GENERATED ALWAYS AS (CASE WHEN spent > 0 THEN revenue / spent ELSE 0 END) STORED,
  cpa NUMERIC(8,2) GENERATED ALWAYS AS (CASE WHEN conversions > 0 THEN spent / conversions ELSE 0 END) STORED,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ad Groups
CREATE TABLE ad_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads
CREATE TABLE ads (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ad_group_id INT REFERENCES ad_groups(id) ON DELETE CASCADE,
  format TEXT NOT NULL DEFAULT 'image',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events (core tracking table)
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('pageview', 'click', 'conversion', 'impression', 'video_view', 'scroll', 'form_submit')),
  anonymous_id TEXT NOT NULL,
  resolved_id TEXT,
  session_id TEXT,
  campaign_id INT REFERENCES campaigns(id),
  channel_id INT REFERENCES channels(id),
  device TEXT NOT NULL DEFAULT 'Desktop' CHECK (device IN ('Desktop', 'Mobile', 'Tablet')),
  page_url TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  value NUMERIC(10,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Identity Graph
CREATE TABLE identities (
  id SERIAL PRIMARY KEY,
  resolved_id TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  device TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resolved_id, anonymous_id)
);

-- Sessions
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  resolved_id TEXT,
  anonymous_id TEXT NOT NULL,
  device TEXT NOT NULL,
  channel_id INT REFERENCES channels(id),
  landing_page TEXT,
  pages_viewed INT DEFAULT 1,
  duration_seconds INT DEFAULT 0,
  converted BOOLEAN DEFAULT FALSE,
  conversion_value NUMERIC(10,2) DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Attribution Results
CREATE TABLE attribution_results (
  id SERIAL PRIMARY KEY,
  channel_id INT REFERENCES channels(id),
  model TEXT NOT NULL CHECK (model IN ('last_touch', 'first_touch', 'linear', 'time_decay', 'position_based', 'data_driven')),
  attributed_conversions NUMERIC(10,2) NOT NULL DEFAULT 0,
  attributed_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  weight_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Creatives
CREATE TABLE creatives (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'image',
  duration TEXT,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  video_views BIGINT DEFAULT 0,
  completion_rate NUMERIC(5,1) DEFAULT 0,
  fatigue_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audience Segments
CREATE TABLE audience_segments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  size INT NOT NULL DEFAULT 0,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  overlap_pct NUMERIC(5,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Performance (materialized daily rollup)
CREATE TABLE daily_performance (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  campaign_id INT REFERENCES campaigns(id),
  channel_id INT REFERENCES channels(id),
  device TEXT,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  pageviews BIGINT DEFAULT 0,
  sessions INT DEFAULT 0,
  bounce_rate NUMERIC(5,1) DEFAULT 0,
  avg_session_duration INT DEFAULT 0,
  UNIQUE(date, campaign_id, channel_id, device)
);

-- Geo Performance
CREATE TABLE geo_performance (
  id SERIAL PRIMARY KEY,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0,
  revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_created ON events(created_at);
CREATE INDEX idx_events_resolved ON events(resolved_id);
CREATE INDEX idx_events_anonymous ON events(anonymous_id);
CREATE INDEX idx_events_channel ON events(channel_id);
CREATE INDEX idx_events_campaign ON events(campaign_id);
CREATE INDEX idx_daily_perf_date ON daily_performance(date);
CREATE INDEX idx_daily_perf_campaign ON daily_performance(campaign_id);
CREATE INDEX idx_sessions_resolved ON sessions(resolved_id);
CREATE INDEX idx_identities_resolved ON identities(resolved_id);
CREATE INDEX idx_attribution_model ON attribution_results(model);

-- Enable Row Level Security (all tables public read for now)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribution_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_performance ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read" ON channels FOR SELECT USING (true);
CREATE POLICY "Public read" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public read" ON ad_groups FOR SELECT USING (true);
CREATE POLICY "Public read" ON ads FOR SELECT USING (true);
CREATE POLICY "Public read" ON events FOR SELECT USING (true);
CREATE POLICY "Public read" ON identities FOR SELECT USING (true);
CREATE POLICY "Public read" ON sessions FOR SELECT USING (true);
CREATE POLICY "Public read" ON attribution_results FOR SELECT USING (true);
CREATE POLICY "Public read" ON creatives FOR SELECT USING (true);
CREATE POLICY "Public read" ON audience_segments FOR SELECT USING (true);
CREATE POLICY "Public read" ON daily_performance FOR SELECT USING (true);
CREATE POLICY "Public read" ON geo_performance FOR SELECT USING (true);

-- Public insert policies (for seeding and event ingestion)
CREATE POLICY "Public insert" ON channels FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON ad_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON ads FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON identities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON attribution_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON creatives FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON audience_segments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON daily_performance FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert" ON geo_performance FOR INSERT WITH CHECK (true);
