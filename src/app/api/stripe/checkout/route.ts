import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { priceId, planId, userId, billingCycle } = await req.json();

    if (!priceId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if customer already exists
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = existingSub?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      // Get username from users table
      const { data: userData } = await supabase
        .from("users")
        .select("username, full_name")
        .eq("id", userId)
        .single();

      const customer = await stripe.customers.create({
        name: userData?.full_name || userData?.username || undefined,
        metadata: { userId, planId, username: userData?.username || "" },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/billing?success=true`,
      cancel_url: `${req.nextUrl.origin}/pricing?canceled=true`,
      subscription_data: {
        metadata: { userId, planId, billingCycle },
        trial_period_days: 14,
      },
      metadata: { userId, planId },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
