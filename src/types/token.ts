import type { GetTokensV2InfoResponse } from "@token-layer/sdk-typescript";

export type Token = GetTokensV2InfoResponse["tokens"][number];
export type TokenAddress = Token["token_addresses"][number];
export type Pagination = GetTokensV2InfoResponse["pagination"];
export type GetTokensResponse = GetTokensV2InfoResponse;

export type FilterType = "all" | "graduated" | "bonding_curve";
