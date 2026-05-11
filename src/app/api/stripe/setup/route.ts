import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// Run this once to create Stripe products and prices
// Visit /api/stripe/setup to trigger it
export async function GET() {
  try {
    const plans = [
      { name: "Veloxis Starter", monthly: 4900, yearly: 47000 },
      { name: "Veloxis Growth", monthly: 14900, yearly: 143000 },
      { name: "Veloxis Enterprise", monthly: 39900, yearly: 383000 },
    ];

    const results = [];

    for (const plan of plans) {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
      });

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthly,
        currency: "usd",
        recurring: { interval: "month" },
      });

      // Create yearly price
      const yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.yearly,
        currency: "usd",
        recurring: { interval: "year" },
      });

      results.push({
        product: plan.name,
        productId: product.id,
        monthlyPriceId: monthlyPrice.id,
        yearlyPriceId: yearlyPrice.id,
      });
    }

    return NextResponse.json({
      message: "Products and prices created! Copy these IDs to your stripe.ts config.",
      results,
    });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
