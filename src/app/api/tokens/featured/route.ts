import { NextResponse } from "next/server";
import type { GetTokensV2InfoResponse } from "@token-layer/sdk-typescript";
import { getTokenLayerClient } from "@/lib/token-layer";

// Disable caching for this route
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tokenLayerId = process.env.NEXT_PUBLIC_FEATURED_TOKEN_ID;

    if (!tokenLayerId) {
      return NextResponse.json(
        { success: false, error: "Featured token ID not configured" },
        { status: 400 }
      );
    }

    const tokenLayer = getTokenLayerClient();
    const data = (await tokenLayer.info.getTokensV2({
      keyword: tokenLayerId,
      limit: 1,
      offset: 0,
      verified_only: true,
      order_by: "created_at",
      order_direction: "DESC",
    })) as GetTokensV2InfoResponse;

    if (!data.tokens || data.tokens.length === 0) {
      return NextResponse.json(
        { success: false, error: "Featured token not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      token: data.tokens[0],
    });
  } catch (error) {
    console.error("Error fetching featured token:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured token" },
      { status: 500 }
    );
  }
}
