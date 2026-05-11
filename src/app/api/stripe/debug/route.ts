import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 10 });
    const customers = await stripe.customers.list({ limit: 10 });
    const subscriptions = await stripe.subscriptions.list({ limit: 10, status: "all" });

    return NextResponse.json({
      sessions: sessions.data.map(s => ({
        id: s.id,
        status: s.status,
        metadata: s.metadata,
        customer: s.customer,
        subscription: s.subscription,
      })),
      customers: customers.data.map(c => ({
        id: c.id,
        name: c.name,
        metadata: c.metadata,
      })),
      subscriptions: subscriptions.data.map(s => ({
        id: s.id,
        status: s.status,
        metadata: s.metadata,
        customer: s.customer,
        plan: s.metadata?.planId,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
