"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PLANS } from "@/lib/stripe";

const features = [
  {
    title: "Multi-Touch Attribution",
    description: "Track every touchpoint across channels. Know exactly which campaigns, ads, and creatives drive conversions.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v12m0 0a3 3 0 103 3H15a3 3 0 100-3m-9 0h9m-9 0a3 3 0 01-3-3m12-6a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Event Stream",
    description: "Watch events flow in live — pageviews, clicks, conversions, and revenue — as they happen across your properties.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    title: "AI-Powered Insights",
    description: "Our AI analyzes your data 24/7, surfacing anomalies, opportunities, and actionable recommendations automatically.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    title: "Cross-Channel Analytics",
    description: "Unify data from Google, Meta, TikTok, LinkedIn, and more into a single dashboard. Compare performance side by side.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Identity Resolution",
    description: "Stitch anonymous visitors into known profiles across devices and sessions. Build a complete customer journey.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.26 8.51M12 10.5a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Smart Recommendations",
    description: "Get budget allocation suggestions, bid optimization tips, and creative rotation advice based on your actual performance data.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "VP of Growth, ScaleUp",
    avatar: "SC",
    quote: "Veloxis cut our attribution blind spots by 80%. We finally know which channels actually drive revenue, not just clicks.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Performance Lead, BrightMedia",
    avatar: "MR",
    quote: "The AI insights alone paid for the platform in week one. It caught a $12K/day wasted spend we completely missed.",
  },
  {
    name: "Emily Watson",
    role: "CMO, GrowthLab",
    avatar: "EW",
    quote: "We switched from Triple Whale and saved 60% while getting better cross-channel attribution. The real-time events are incredible.",
  },
];

const stats = [
  { value: "2.4B+", label: "Events Tracked" },
  { value: "340%", label: "Avg. ROAS Improvement" },
  { value: "500+", label: "Brands Trust Veloxis" },
  { value: "< 50ms", label: "Event Latency" },
];

const logos = ["Google Ads", "Meta Ads", "TikTok", "LinkedIn", "Shopify", "HubSpot"];

type PlanKey = "starter" | "growth" | "enterprise";
const planOrder: PlanKey[] = ["starter", "growth", "enterprise"];

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-card-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <span className="text-lg font-bold text-text-primary">Veloxis</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-light hover:text-text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-light hover:text-text-primary transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-light hover:text-text-primary transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-light hover:text-text-primary transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link href="/login" className="text-sm font-semibold bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-all">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-accent-light">Now tracking 2.4 billion events monthly</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary leading-[1.1] mb-6">
            Stop guessing.<br />
            <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
              Start knowing.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-light max-w-2xl mx-auto mb-10">
            Veloxis unifies your marketing data across every channel, giving you real-time attribution,
            AI-powered insights, and the clarity to scale what works.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-base transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40"
            >
              Start Free 14-Day Trial
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-card-border text-text-primary font-semibold text-base hover:border-accent/40 transition-all flex items-center justify-center gap-2"
            >
              See How It Works
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mx-auto max-w-4xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 via-purple-500/20 to-accent/20 rounded-2xl blur-2xl opacity-50" />
            <div className="relative bg-card-bg border border-card-border rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-card-border">
                <div className="w-3 h-3 rounded-full bg-danger/60" />
                <div className="w-3 h-3 rounded-full bg-warning/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
                <span className="ml-3 text-xs text-muted font-mono">veloxis — Dashboard</span>
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: "$284,392", change: "+23.5%" },
                  { label: "Conversions", value: "12,847", change: "+18.2%" },
                  { label: "ROAS", value: "4.2x", change: "+0.8x" },
                  { label: "Cost per Acquisition", value: "$12.40", change: "-15.3%" },
                ].map((m) => (
                  <div key={m.label} className="bg-background rounded-lg p-4">
                    <p className="text-[10px] text-muted uppercase tracking-wider mb-1">{m.label}</p>
                    <p className="text-xl font-bold text-text-primary">{m.value}</p>
                    <span className={`text-xs font-medium ${m.change.startsWith("+") || m.change.startsWith("-1") ? "text-success" : "text-danger"}`}>
                      {m.change}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <div className="bg-background rounded-lg p-4 h-40 flex items-end gap-1">
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-accent/40 hover:bg-accent/70 transition-colors"
                      style={{ height: `${30 + Math.sin(i * 0.5) * 25 + Math.random() * 40}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social Proof */}
      <section className="py-12 border-y border-card-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted uppercase tracking-widest mb-8">Integrates with your stack</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {logos.map((name) => (
              <span key={name} className="text-sm font-semibold text-muted-light/50 hover:text-muted-light transition-colors">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-light">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-accent uppercase tracking-widest">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-3 mb-4">
              Everything you need to<br />master your marketing
            </h2>
            <p className="text-muted-light max-w-xl mx-auto">
              From real-time tracking to AI recommendations, Veloxis gives you the complete toolkit to optimize every dollar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card-bg border border-card-border rounded-xl p-6 hover:border-accent/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent-light mb-4 group-hover:bg-accent/15 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-light leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card-bg/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-accent uppercase tracking-widest">How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-3 mb-4">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Connect Your Channels", desc: "Link your ad platforms with one click. Google, Meta, TikTok, LinkedIn — we support them all." },
              { step: "02", title: "Install the Pixel", desc: "Drop a single line of code on your site. We start tracking events, conversions, and user journeys instantly." },
              { step: "03", title: "Get Actionable Insights", desc: "Our AI analyzes your data in real-time and surfaces what matters — wasted spend, winning creatives, scaling opportunities." },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
                  <span className="text-lg font-bold text-accent-light">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold text-accent uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-3 mb-4">
              Loved by growth teams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card-bg border border-card-border rounded-xl p-6">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-muted-light leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-accent-light">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-card-bg/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-accent uppercase tracking-widest">Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mt-3 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-light">Start free for 14 days. No credit card required.</p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-text-primary" : "text-muted"}`}>Monthly</span>
              <button
                onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${billingCycle === "yearly" ? "bg-accent" : "bg-card-border"}`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${billingCycle === "yearly" ? "left-8" : "left-1"}`} />
              </button>
              <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-text-primary" : "text-muted"}`}>Yearly</span>
              {billingCycle === "yearly" && (
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Save 20%</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {planOrder.map((planId) => {
              const plan = PLANS[planId];
              const monthlyEquivalent = billingCycle === "yearly" ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
              const isPopular = "popular" in plan && plan.popular;

              return (
                <div
                  key={planId}
                  className={`relative bg-card-bg rounded-2xl border flex flex-col ${
                    isPopular ? "border-accent shadow-lg shadow-accent/10 scale-[1.02]" : "border-card-border"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-accent text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</span>
                    </div>
                  )}
                  <div className="p-6 lg:p-8 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-text-primary mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-light mb-5">{plan.description}</p>
                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-4xl font-bold text-text-primary">${monthlyEquivalent}</span>
                      <span className="text-muted-light text-sm mb-1">/month</span>
                    </div>
                    <Link
                      href="/login"
                      className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all mb-6 text-center block ${
                        isPopular
                          ? "bg-accent hover:bg-accent/90 text-white"
                          : "bg-card-bg border border-card-border text-text-primary hover:border-accent hover:text-accent"
                      }`}
                    >
                      Start Free Trial
                    </Link>
                    <div className="space-y-3 flex-1">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <svg className="w-4 h-4 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-muted-light">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            Ready to see what your marketing<br />data is really telling you?
          </h2>
          <p className="text-muted-light text-lg mb-8">
            Join 500+ brands using Veloxis to make smarter, faster marketing decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-base transition-all shadow-lg shadow-accent/25"
            >
              Start Your Free Trial
            </Link>
            <span className="text-sm text-muted">No credit card required</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Logo size={28} />
                <span className="text-base font-bold text-text-primary">Veloxis</span>
              </div>
              <p className="text-sm text-muted-light">Marketing intelligence powered by AI.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-light hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-muted-light hover:text-text-primary transition-colors">Pricing</a></li>
                <li><Link href="/login" className="text-sm text-muted-light hover:text-text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-light hover:text-text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-muted-light hover:text-text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-light hover:text-text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-light hover:text-text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-light hover:text-text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-muted-light hover:text-text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-card-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted">&copy; {new Date().getFullYear()} Veloxis. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted hover:text-muted-light transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="#" className="text-muted hover:text-muted-light transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
