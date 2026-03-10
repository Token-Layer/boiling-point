import { NextRequest, NextResponse } from "next/server";
import type { ChainSlug, CreateTokenActionDraft } from "@token-layer/sdk-typescript";
import { getTokenLayerClient } from "@/lib/token-layer";

function getConfiguredChains() {
  const chainSlug = ((process.env.NEXT_PUBLIC_INITIAL_CHAIN || "base").trim() || "base") as ChainSlug;
  const destinationChains = (process.env.NEXT_PUBLIC_DESTINATION_CHAINS || "solana,ethereum,bnb")
    .split(",")
    .map((chain) => chain.trim())
    .filter(Boolean) as ChainSlug[];

  return { chainSlug, destinationChains };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.TOKEN_LAYER_API_KEY?.trim();
    const privateKey = process.env.TOKEN_LAYER_PRIVATE_KEY?.trim();
    if (!apiKey && !privateKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Server auth is not configured. Set TOKEN_LAYER_PRIVATE_KEY or TOKEN_LAYER_API_KEY.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const { chainSlug, destinationChains } = getConfiguredChains();
    const tokenLayer = getTokenLayerClient();

    const actionPayload: CreateTokenActionDraft = {
      ...(body as CreateTokenActionDraft),
      chainSlug,
      destinationChains,
    };

    const result = await tokenLayer.action.createToken({
      action: actionPayload,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating token transaction:", error);
    const message = error instanceof Error ? error.message : "Failed to create token transaction.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
