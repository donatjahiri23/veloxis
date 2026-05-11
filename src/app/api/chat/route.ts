import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { generateAiContextSnapshot } from "@/lib/ai-context-data";

const SYSTEM_PROMPT = `You are the Veloxis AI assistant — an expert marketing analytics advisor embedded in the Veloxis Marketing Intelligence Platform.

The platform tracks marketing signals (page views, conversions, ad impressions, video views, cross-domain navigation, view-through events), has an identity resolution engine that stitches anonymous touchpoints into unified user journeys, a multi-touch attribution engine (Last Touch, First Touch, Linear, Time Decay, Position Based, Data-Driven/Shapley), and provides campaign analytics across channels (Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads, Display, YouTube, Email, Organic Search).

Key metrics you understand:
- ROAS (Return On Ad Spend) = Revenue / Ad Spend
- CPA (Cost Per Acquisition) = Spend / Conversions
- CPL (Cost Per Lead) = Spend / Leads
- CTR (Click Through Rate) = Clicks / Impressions
- LTV (Lifetime Value), CAC (Customer Acquisition Cost)

You help marketers:
- Analyze campaign performance and identify optimization opportunities
- Compare attribution models and understand channel valuation differences
- Understand user journeys and cross-device behavior
- Make budget allocation decisions based on data
- Interpret funnel metrics, creative performance, and audience segments
- Plan A/B tests and campaign strategies

You have FULL ACCESS to the platform's current data below. Always reference specific campaigns, channels, numbers, and metrics from this data when answering. Be specific — cite actual campaign names, ROAS values, spend amounts, and conversion numbers. Never say "I don't have access to your data" — you DO have it.

Keep responses concise, data-focused, and actionable. Use **bold** for key metrics and insights. Always suggest concrete next steps.`;

const dataSnapshot = generateAiContextSnapshot();

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.VELOXIS_ANTHROPIC_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured. Add VELOXIS_ANTHROPIC_KEY to your .env.local file." },
        { status: 401 }
      );
    }

    const client = new Anthropic({ apiKey });
    const { messages, pageContext } = await req.json();

    const contextNote = pageContext
      ? `\n\nThe user is currently on the "${pageContext}" page of the platform. Tailor your response to be relevant to what they're viewing.`
      : "";

    const fullSystemPrompt = SYSTEM_PROMPT + "\n\n" + dataSnapshot + contextNote;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: fullSystemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("");

    return NextResponse.json({ content: text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat API error:", message);

    if (message.includes("authentication") || message.includes("api_key") || message.includes("401")) {
      return NextResponse.json(
        { error: "Invalid API key. Check your VELOXIS_ANTHROPIC_KEY in .env.local" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get response from AI. Please try again." },
      { status: 500 }
    );
  }
}
