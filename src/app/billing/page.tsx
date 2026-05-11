"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { useSubscription } from "@/components/SubscriptionProvider";
import { PLANS } from "@/lib/stripe";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const { user, profile } = useAuth();
  const { subscription, plan, isActive, isTrial, trialDaysLeft } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const router = useRouter();

  const currentPlan = PLANS[plan];

  const handleManageBilling = async () => {
    if (!subscription?.stripe_customer_id) {
      router.push("/pricing");
      return;
    }

    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: subscription.stripe_customer_id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Portal error:", err);
    } finally {
      setPortalLoading(false);
    }
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "bg-success/10", text: "text-success", label: "Active" },
    trialing: { bg: "bg-accent/10", text: "text-accent-light", label: "Trial" },
    past_due: { bg: "bg-warning/10", text: "text-warning", label: "Past Due" },
    canceled: { bg: "bg-danger/10", text: "text-danger", label: "Canceled" },
    free: { bg: "bg-muted/10", text: "text-muted-light", label: "Free" },
  };

  const status = statusColors[subscription?.status || "free"] || statusColors.free;

  return (
    <div className="p-4 lg:p-8 min-h-screen">
      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your plan, billing information, and invoices"
      />

      {/* Trial banner */}
      {isTrial && trialDaysLeft > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {trialDaysLeft} days left in your free trial
              </p>
              <p className="text-xs text-muted-light">
                Upgrade to keep access to all features after your trial ends.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/pricing")}
            className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-all flex-shrink-0"
          >
            Upgrade Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current plan card */}
        <div className="lg:col-span-2 bg-card-bg rounded-xl border border-card-border p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Current Plan</h3>
              <p className="text-sm text-muted-light mt-0.5">Your active subscription details</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>

          <div className="flex items-end gap-2 mb-6">
            <h2 className="text-3xl font-bold text-text-primary">{currentPlan.name}</h2>
            <span className="text-muted-light text-sm mb-1">
              ${currentPlan.monthlyPrice}/month
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-background rounded-lg p-3">
              <p className="text-xs text-muted mb-1">Ad Accounts</p>
              <p className="text-lg font-bold text-text-primary">
                {currentPlan.limits.adAccounts === -1 ? "Unlimited" : currentPlan.limits.adAccounts}
              </p>
            </div>
            <div className="bg-background rounded-lg p-3">
              <p className="text-xs text-muted mb-1">Events/mo</p>
              <p className="text-lg font-bold text-text-primary">
                {currentPlan.limits.eventsPerMonth === -1
                  ? "Unlimited"
                  : `${(currentPlan.limits.eventsPerMonth / 1000).toFixed(0)}K`}
              </p>
            </div>
            <div className="bg-background rounded-lg p-3">
              <p className="text-xs text-muted mb-1">Retention</p>
              <p className="text-lg font-bold text-text-primary">
                {currentPlan.limits.dataRetentionDays} days
              </p>
            </div>
            <div className="bg-background rounded-lg p-3">
              <p className="text-xs text-muted mb-1">Team Members</p>
              <p className="text-lg font-bold text-text-primary">
                {currentPlan.limits.teamMembers === -1 ? "Unlimited" : currentPlan.limits.teamMembers}
              </p>
            </div>
          </div>

          {subscription?.current_period_end && (
            <p className="text-xs text-muted">
              {subscription.cancel_at_period_end
                ? `Your plan will be canceled on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                : `Next billing date: ${new Date(subscription.current_period_end).toLocaleDateString()}`}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-card-border">
            <button
              onClick={() => router.push("/pricing")}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold transition-all"
            >
              {isActive ? "Change Plan" : "Upgrade"}
            </button>
            {subscription?.stripe_customer_id && (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="px-4 py-2 rounded-lg border border-card-border text-text-primary hover:border-accent text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {portalLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                )}
                Manage Billing
              </button>
            )}
          </div>
        </div>

        {/* Account info card */}
        <div className="bg-card-bg rounded-xl border border-card-border p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">Account</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted mb-1">Name</p>
              <p className="text-sm font-medium text-text-primary">
                {profile?.full_name || "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Email</p>
              <p className="text-sm font-medium text-text-primary">{profile?.email || user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Role</p>
              <p className="text-sm font-medium text-text-primary capitalize">{profile?.role || "owner"}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Member Since</p>
              <p className="text-sm font-medium text-text-primary">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">User ID</p>
              <p className="text-[10px] font-mono text-muted-light break-all">{profile?.id || user?.id}</p>
            </div>
            {subscription?.stripe_customer_id && (
              <div>
                <p className="text-xs text-muted mb-1">Customer ID</p>
                <p className="text-[10px] font-mono text-muted-light break-all">
                  {subscription.stripe_customer_id}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-card-border">
            <h4 className="text-sm font-semibold text-text-primary mb-3">Plan Features</h4>
            <div className="space-y-2">
              {currentPlan.features.slice(0, 5).map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-muted-light">{feature}</span>
                </div>
              ))}
              {currentPlan.features.length > 5 && (
                <p className="text-xs text-muted">+{currentPlan.features.length - 5} more</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
