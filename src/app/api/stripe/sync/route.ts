import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

// Sync subscription status from Stripe after checkout
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get the subscription record
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (!sub?.stripe_customer_id) {
      // No Stripe customer yet — check if there's a recent checkout session for this user
      // Search by metadata
      const sessions = await stripe.checkout.sessions.list({ limit: 10 });
      const userSession = sessions.data.find(
        (s) => s.metadata?.userId === userId && s.status === "complete"
      );

      if (!userSession || !userSession.subscription) {
        return NextResponse.json({ status: "no_subscription" });
      }

      const subId = typeof userSession.subscription === "string"
        ? userSession.subscription
        : userSession.subscription.id;
      const custId = typeof userSession.customer === "string"
        ? userSession.customer
        : userSession.customer?.id || null;

      const subscription = await stripe.subscriptions.retrieve(subId);
      const periodEnd = subscription.items?.data?.[0]?.current_period_end || null;

      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: custId,
          stripe_subscription_id: subscription.id,
          plan: userSession.metadata?.planId || "starter",
          status: subscription.status === "trialing" ? "trialing" : "active",
          trial_ends_at: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
        { onConflict: "user_id" }
      );

      return NextResponse.json({ status: "synced", plan: userSession.metadata?.planId });
    }

    // Customer exists — get their latest subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: sub.stripe_customer_id,
      status: "all",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ status: "no_active_subscription" });
    }

    const subscription = subscriptions.data[0];
    const periodEnd = subscription.items?.data?.[0]?.current_period_end || null;

    await supabase
      .from("subscriptions")
      .update({
        stripe_subscription_id: subscription.id,
        plan: subscription.metadata?.planId || "starter",
        status: subscription.status === "trialing" ? "trialing" : subscription.status,
        trial_ends_at: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        current_period_end: periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq("user_id", userId);

    return NextResponse.json({
      status: "synced",
      plan: subscription.metadata?.planId,
      subscriptionStatus: subscription.status,
    });
  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
