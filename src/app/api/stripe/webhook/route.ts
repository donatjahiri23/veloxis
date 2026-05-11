import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Helper to safely get period end from subscription items
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): number | null {
  const items = subscription.items?.data;
  if (items && items.length > 0 && items[0].current_period_end) {
    return items[0].current_period_end;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId && session.subscription) {
          const subId = typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

          const subscription = await stripe.subscriptions.retrieve(subId);
          const periodEnd = getSubscriptionPeriodEnd(subscription);
          const custId = typeof session.customer === "string"
            ? session.customer
            : session.customer?.id || null;

          await getSupabaseAdmin().from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id: custId,
              stripe_subscription_id: subscription.id,
              plan: planId || "starter",
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
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const periodEnd = getSubscriptionPeriodEnd(subscription);

        if (userId) {
          await getSupabaseAdmin()
            .from("subscriptions")
            .update({
              status: subscription.status === "trialing" ? "trialing" : subscription.status,
              plan: subscription.metadata?.planId || undefined,
              current_period_end: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_ends_at: subscription.trial_end
                ? new Date(subscription.trial_end * 1000).toISOString()
                : null,
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await getSupabaseAdmin()
            .from("subscriptions")
            .update({
              status: "canceled",
              stripe_subscription_id: null,
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        if (subRef) {
          const subId = typeof subRef === "string" ? subRef : subRef.id;
          const subscription = await stripe.subscriptions.retrieve(subId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            await getSupabaseAdmin()
              .from("subscriptions")
              .update({ status: "past_due" })
              .eq("user_id", userId);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
