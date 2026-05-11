"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import type { PlanId } from "@/lib/stripe";

interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "free";
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  isTrial: boolean;
  trialDaysLeft: number;
  plan: PlanId;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  loading: true,
  isActive: false,
  isTrial: false,
  trialDaysLeft: 0,
  plan: "starter",
  refresh: async () => {},
});

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      // No subscription found — create a free trial
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const newSub = {
        user_id: user.id,
        plan: "starter" as PlanId,
        status: "trialing" as const,
        trial_ends_at: trialEnd.toISOString(),
        cancel_at_period_end: false,
      };

      const { data: created } = await supabase
        .from("subscriptions")
        .upsert(newSub, { onConflict: "user_id" })
        .select()
        .single();

      setSubscription(created);
    } else {
      setSubscription(data);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isActive = subscription?.status === "active" || subscription?.status === "trialing";

  const isTrial = subscription?.status === "trialing";

  const trialDaysLeft = subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const plan = (subscription?.plan || "starter") as PlanId;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        isActive,
        isTrial,
        trialDaysLeft,
        plan,
        refresh: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}
