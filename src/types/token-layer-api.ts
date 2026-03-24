import type { CreateTokenResult, QuoteTokenInfoResponse } from "@token-layer/sdk-typescript";

export type TokenLayerApiError = {
  success: false;
  error?: string;
};

export type CreateTokenEndpointResponse = CreateTokenResult | TokenLayerApiError;

export type QuoteTokenEndpointResponse =
  | {
      success: true;
      quote: QuoteTokenInfoResponse;
    }
  | TokenLayerApiError;
