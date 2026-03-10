import type { GetTokensV2Params } from "@token-layer/sdk-typescript";
import type { GetTokensV2InfoResponse } from "@token-layer/sdk-typescript";
import { GetTokensResponse, FilterType } from "@/types/token";

interface GetTokensParams {
  filter: FilterType;
  limit?: number;
  offset?: number;
}

export async function getTokens({
  filter,
  limit = 20,
  offset = 0,
}: GetTokensParams): Promise<GetTokensResponse> {
  const initialChain = process.env.NEXT_PUBLIC_INITIAL_CHAIN || "base";
  const destinationChains = (
    process.env.NEXT_PUBLIC_DESTINATION_CHAINS || "solana,ethereum,bnb"
  ).split(",");

  // Combine initial chain with destination chains for the API request
  const chains = [initialChain, ...destinationChains];

  const builderCode = process.env.BUILDER_CODE;

  const body: GetTokensV2Params = {
    chains: chains as GetTokensV2Params["chains"],
    order_by: "created_at",
    order_direction: "DESC",
    limit,
    offset,
    ...(builderCode && { builder_code: builderCode }),
    verified_only: filter === "graduated",
  };

  const { getTokenLayerClient } = await import("@/lib/token-layer");
  const tokenLayer = getTokenLayerClient();
  const data = (await tokenLayer.info.getTokensV2(body)) as GetTokensV2InfoResponse;

  // Client-side filter for bonding curve (tokens without token_layer_id)
  if (filter === "bonding_curve") {
    data.tokens = data.tokens.filter((token) => !token.token_layer_id);
  }

  return data as unknown as GetTokensResponse;
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return "-";
  if (price < 0.0001) return `$${price.toExponential(2)}`;
  if (price < 1) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(2)}`;
}

export function formatPercentage(percent: number | null | undefined): string {
  if (percent === null || percent === undefined) return "-";
  const sign = percent >= 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

export function getTradeUrl(tokenLayerId: string | null): string | null {
  if (!tokenLayerId) return null;
  const baseUrl = `https://app.tokenlayer.network/token/${tokenLayerId}`;
  const refAddress = process.env.NEXT_PUBLIC_REF_ADDRESS;
  if (refAddress) {
    return `${baseUrl}?ref=${refAddress}`;
  }
  return baseUrl;
}
