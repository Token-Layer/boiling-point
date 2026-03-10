import { NextRequest, NextResponse } from "next/server";
import type { GetTokensV2InfoResponse, GetTokensV2Params } from "@token-layer/sdk-typescript";
import { FilterType } from "@/types/token";
import { getTokenLayerClient } from "@/lib/token-layer";

type SortOption = GetTokensV2Params["order_by"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filter, sortBy = "created_at", limit = 20, offset = 0 } = body as {
      filter: FilterType;
      sortBy?: SortOption;
      limit?: number;
      offset?: number;
    };

    const initialChain = process.env.NEXT_PUBLIC_INITIAL_CHAIN || "base";
    const destinationChains = (
      process.env.NEXT_PUBLIC_DESTINATION_CHAINS || "solana,ethereum,bnb"
    ).split(",");

    const chains = [initialChain, ...destinationChains];

    const apiBody: GetTokensV2Params = {
      chains: chains as GetTokensV2Params["chains"],
      order_by: sortBy,
      order_direction: "DESC",
      limit,
      offset,
      verified_only: filter === "graduated",
    };

    const tokenLayer = getTokenLayerClient();
    const data = (await tokenLayer.info.getTokensV2(apiBody)) as GetTokensV2InfoResponse;

    // Client-side filter for bonding curve (tokens without token_layer_id)
    if (filter === "bonding_curve") {
      data.tokens = data.tokens.filter((token) => !token.token_layer_id);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
