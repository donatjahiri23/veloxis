import Stripe from "stripe";

// Lazy initialization to avoid build-time errors when env vars aren't set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

// Keep backward compat — will be called only at runtime
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Define your pricing plans
export const PLANS = {
  starter: {
    name: "Starter",
    description: "For small businesses getting started with marketing analytics",
    monthlyPrice: 49,
    yearlyPrice: 470,
    features: [
      "Up to 3 ad accounts",
      "50,000 events/month",
      "7-day data retention",
      "Basic attribution models",
      "Email support",
      "1 team member",
    ],
    limits: {
      adAccounts: 3,
      eventsPerMonth: 50000,
      dataRetentionDays: 7,
      teamMembers: 1,
    },
  },
  growth: {
    name: "Growth",
    description: "For growing teams that need deeper insights and more power",
    monthlyPrice: 149,
    yearlyPrice: 1430,
    popular: true,
    features: [
      "Up to 15 ad accounts",
      "500,000 events/month",
      "30-day data retention",
      "All attribution models",
      "AI-powered insights",
      "Priority support",
      "5 team members",
      "Custom reports",
    ],
    limits: {
      adAccounts: 15,
      eventsPerMonth: 500000,
      dataRetentionDays: 30,
      teamMembers: 5,
    },
  },
  enterprise: {
    name: "Enterprise",
    description: "For large organizations with advanced needs and custom requirements",
    monthlyPrice: 399,
    yearlyPrice: 3830,
    features: [
      "Unlimited ad accounts",
      "Unlimited events",
      "365-day data retention",
      "All attribution models",
      "AI-powered insights",
      "Dedicated account manager",
      "Unlimited team members",
      "Custom reports & API access",
      "White-label options",
      "SSO & advanced security",
    ],
    limits: {
      adAccounts: -1,
      eventsPerMonth: -1,
      dataRetentionDays: 365,
      teamMembers: -1,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
