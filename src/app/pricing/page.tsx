"use client";

import { useState } from "react";
import { PLANS, PlanId } from "@/lib/stripe";
import { useAuth } from "@/components/AuthProvider";
import { useSubscription } from "@/components/SubscriptionProvider";
import { useRouter } from "next/navigation";

const planOrder: PlanId[] = ["starter", "growth", "enterprise"];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const { plan: currentPlan, isActive } = useSubscription();
  const router = useRouter();

  const handleSelectPlan = async (planId: PlanId) => {
    if (!user) {
      router.push("/login");
      return;
    }

    // If they're on the current plan already, go to billing
    if (planId === currentPlan && isActive) {
      router.push("/billing");
      return;
    }

    setLoadingPlan(planId);

    try {
      // In production, you'd use real Stripe Price IDs here
      // For now, redirect to billing page with plan selection
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: `price_${planId}_${billingCycle}`, // Replace with real Stripe Price IDs
          planId,
          userId: user.id,
          email: user.username,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-muted-light text-lg">
          Start with a 14-day free trial. No credit card required. Upgrade anytime.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-text-primary" : "text-muted"}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
              billingCycle === "yearly" ? "bg-accent" : "bg-card-border"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                billingCycle === "yearly" ? "left-8" : "left-1"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-text-primary" : "text-muted"}`}>
            Yearly
          </span>
          {billingCycle === "yearly" && (
            <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          )}
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {planOrder.map((planId) => {
          const plan = PLANS[planId];
          const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const monthlyEquivalent = billingCycle === "yearly" ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
          const isPopular = "popular" in plan && plan.popular;
          const isCurrent = planId === currentPlan && isActive;

          return (
            <div
              key={planId}
              className={`relative bg-card-bg rounded-2xl border flex flex-col ${
                isPopular
                  ? "border-accent shadow-lg shadow-accent/10 scale-[1.02]"
                  : "border-card-border"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6 lg:p-8 flex-1 flex flex-col">
                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text-primary mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-light">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-text-primary">${monthlyEquivalent}</span>
                    <span className="text-muted-light text-sm mb-1">/month</span>
                  </div>
                  {billingCycle === "yearly" && (
                    <p className="text-xs text-muted mt-1">
                      ${price} billed annually
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(planId)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all mb-6 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-card-bg border-2 border-accent text-accent cursor-default"
                      : isPopular
                      ? "bg-accent hover:bg-accent/90 text-white"
                      : "bg-card-bg border border-card-border text-text-primary hover:border-accent hover:text-accent"
                  } disabled:opacity-50`}
                >
                  {loadingPlan === planId ? (
                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : null}
                  {isCurrent ? "Current Plan" : "Start Free Trial"}
                </button>

                {/* Features */}
                <div className="space-y-3 flex-1">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider">What&apos;s included</p>
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

      {/* FAQ / Trust section */}
      <div className="max-w-2xl mx-auto mt-16 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-text-primary">Secure payments</h4>
            <p className="text-xs text-muted">Powered by Stripe</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-text-primary">Cancel anytime</h4>
            <p className="text-xs text-muted">No lock-in contracts</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-text-primary">14-day free trial</h4>
            <p className="text-xs text-muted">No credit card needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
