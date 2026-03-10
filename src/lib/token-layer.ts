import { MAINNET_API_URL, TokenLayer } from "@token-layer/sdk-typescript";
import { createWalletClient, defineChain, http, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

function toPositiveNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function getTokenLayerApiBaseUrl(): string {
  return process.env.TOKEN_LAYER_API_URL || MAINNET_API_URL;
}

export function getTokenLayerClient() {
  const builderCode = process.env.BUILDER_CODE?.trim();
  const builderFeeBps = toPositiveNumber(process.env.BUILDER_FEE_BPS);

  const client = new TokenLayer({
    baseUrl: getTokenLayerApiBaseUrl(),
    defaults: builderCode
      ? {
          builder: {
            code: builderCode,
            ...(builderFeeBps !== undefined ? { fee: builderFeeBps } : {}),
          },
        }
      : undefined,
  });

  const privateKey = process.env.TOKEN_LAYER_PRIVATE_KEY?.trim();
  if (privateKey) {
    try {
      const normalizedPrivateKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
      const account = privateKeyToAccount(normalizedPrivateKey as `0x${string}`);
      const authChainId = Number(process.env.TOKEN_LAYER_AUTH_CHAIN_ID || "1");
      const authRpcUrl = process.env.TOKEN_LAYER_AUTH_RPC_URL || "https://eth.llamarpc.com";

      const authChain = defineChain({
        id: authChainId,
        name: `token-layer-auth-${authChainId}`,
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: {
          default: { http: [authRpcUrl] },
        },
      });

      const walletClient = createWalletClient({
        account,
        chain: authChain,
        transport: http(authRpcUrl),
      });

      return client.asWallet(walletClient, {
        walletAddress: account.address,
        signatureChainId: toHex(authChainId),
      });
    } catch {
      throw new Error("Invalid TOKEN_LAYER_PRIVATE_KEY configuration.");
    }
  }

  const apiKey = process.env.TOKEN_LAYER_API_KEY?.trim();
  if (apiKey) {
    return client.asApiKey(apiKey);
  }

  return client;
}
