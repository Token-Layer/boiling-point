import { NextRequest, NextResponse } from "next/server";
import type { QuoteTokenParams } from "@token-layer/sdk-typescript";
import { getTokenLayerClient } from "@/lib/token-layer";
import type { QuoteTokenEndpointResponse } from "@/types/token-layer-api";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { amount?: number | string };
    const numericAmount =
      typeof body.amount === "string" ? Number(body.amount) : Number(body.amount ?? NaN);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Amount must be a positive number." } satisfies QuoteTokenEndpointResponse,
        { status: 400 }
      );
    }

    const chainSlug = (process.env.NEXT_PUBLIC_INITIAL_CHAIN || "base").trim();
    const tokenLayer = getTokenLayerClient();
    const params: QuoteTokenParams = {
      amount: numericAmount,
      direction: "buy",
      inputToken: "usdc",
      poolType: "meme",
      chainSlug: chainSlug as QuoteTokenParams["chainSlug"],
    };
    const data = await tokenLayer.info.quoteToken(params);

    return NextResponse.json({ success: true, quote: data } satisfies QuoteTokenEndpointResponse);
  } catch (error) {
    console.error("Error quoting token purchase:", error);
    return NextResponse.json(
      { success: false, error: "Failed to quote token purchase." } satisfies QuoteTokenEndpointResponse,
      { status: 500 }
    );
  }
}
