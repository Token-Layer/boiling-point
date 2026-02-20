export interface TokenAddress {
  id: string;
  token_id: string;
  address: string;
  address_display: string | null;
  address_type: "evm" | "sol";
  chain: string;
  platform_name: string;
  is_registered: boolean;
  dex_name: string | null;
  dex_address: string | null;
  created_at: string;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  slug: string;
  logo: string | null;
  banner_url: string | null;
  video_url: string | null;
  description: string | null;
  token_layer_id: string | null;
  created_at: string;
  holders_count: number | null;
  market_cap: number | null;
  price: number | null;
  volume_1m: number | null;
  volume_5m: number | null;
  volume_1h: number | null;
  volume_24h: number | null;
  price_change_24h: number | null;
  price_change_24h_percent: number | null;
  trx: number | null;
  website_url?: string | null;
  twitter_url?: string | null;
  telegram_url?: string | null;
  discord_url?: string | null;
  github_url?: string | null;
  metadata?: Record<string, unknown> | null;
  token_addresses: TokenAddress[];
}

export interface Pagination {
  limit: number;
  offset: number;
  total_returned: number;
  has_more: boolean;
}

export interface GetTokensResponse {
  success: boolean;
  tokens: Token[];
  pagination: Pagination;
}

export type FilterType = "all" | "graduated" | "bonding_curve";
