import Image from "next/image";
import { Token } from "@/types/token";
import { formatNumber, formatPrice, formatPercentage, getTradeUrl } from "@/lib/api";

interface TokenCardProps {
  token: Token;
  viewMode: "grid" | "list";
}

type TokenLinkItem = {
  label: "Test Idea" | "Website" | "X" | "GitHub";
  url: string;
};

// Map chain names to icon files
const CHAIN_ICONS: Record<string, string> = {
  base: "/images/icons/base.svg",
  "base-sepolia": "/images/icons/base-sepolia.svg",
  solana: "/images/icons/solana.svg",
  ethereum: "/images/icons/ethereum.svg",
  bnb: "/images/icons/bnb.svg",
  "bnb-testnet": "/images/icons/bnb-testnet.svg",
  arbitrum: "/images/icons/arbitrum.svg",
  polygon: "/images/icons/polygon.svg",
  avalanche: "/images/icons/avalanche.svg",
  unichain: "/images/icons/unichain.svg",
  "unichain-testnet": "/images/icons/unichain-testnet.svg",
  zksync: "/images/icons/zksync.svg",
  abstract: "/images/icons/abstract.svg",
  monad: "/images/icons/monad.svg",
};

function ChainIcon({ chain, isRegistered = true }: { chain: string; isRegistered?: boolean }) {
  const iconPath = CHAIN_ICONS[chain.toLowerCase()];

  if (iconPath) {
    return (
      <Image
        src={iconPath}
        alt={chain}
        width={16}
        height={16}
        className={`w-4 h-4 rounded-sm ${!isRegistered ? "opacity-40 grayscale" : ""}`}
      />
    );
  }

  // Fallback: show first letter
  return (
    <span
      className={`w-4 h-4 flex items-center justify-center text-[8px] font-bold bg-[#1a2332] text-[#8892b0] rounded-sm uppercase ${!isRegistered ? "opacity-40" : ""}`}
    >
      {chain.charAt(0)}
    </span>
  );
}

function ChainBadge({ chain, isRegistered, showLabel = true, size = "sm" }: {
  chain: string;
  isRegistered: boolean;
  showLabel?: boolean;
  size?: "sm" | "md";
}) {
  const tooltip = isRegistered ? chain : "Awaiting graduation";
  const isSmall = size === "sm";

  return (
    <div className="relative group/badge">
      <div
        className={`flex items-center gap-1.5 bg-[#111827]/85 rounded cursor-default ${
          !isRegistered ? "opacity-50" : ""
        } ${isSmall ? "px-2 py-1" : "px-2.5 py-1.5"}`}
      >
        <ChainIcon chain={chain} isRegistered={isRegistered} />
        {showLabel && (
          <span className={`text-[#8892b0] capitalize ${isSmall ? "text-[10px]" : "text-xs"}`}>
            {chain}
          </span>
        )}
      </div>
      {/* Custom Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1a2332] border border-[rgba(136,146,176,0.2)] rounded-lg opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
        <span className={`text-xs font-medium ${isRegistered ? "text-[#f0f4ff]" : "text-[#fbbf24]"}`}>
          {tooltip}
        </span>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a2332]" />
      </div>
    </div>
  );
}

function normalizeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

function getFromRecord(record: Record<string, unknown> | null | undefined, key: string): unknown {
  if (!record) return undefined;
  return record[key];
}

function getTokenLinks(token: Token): TokenLinkItem[] {
  const tokenRecord = token as unknown as Record<string, unknown>;
  const metadataRaw = getFromRecord(tokenRecord, "metadata");
  const metadata = metadataRaw && typeof metadataRaw === "object" ? (metadataRaw as Record<string, unknown>) : null;
  const metadataLinksRaw = getFromRecord(metadata, "links");
  const metadataLinks =
    metadataLinksRaw && typeof metadataLinksRaw === "object"
      ? (metadataLinksRaw as Record<string, unknown>)
      : null;

  const ideaUrl = normalizeUrl(
    getFromRecord(metadata, "idea_url") ??
      getFromRecord(metadata, "ideaUrl") ??
      getFromRecord(metadata, "demo_url") ??
      getFromRecord(metadata, "demoUrl") ??
      getFromRecord(metadataLinks, "idea") ??
      getFromRecord(metadataLinks, "demo") ??
      getFromRecord(metadataLinks, "app") ??
      getFromRecord(metadataLinks, "product")
  );

  const websiteUrl = normalizeUrl(
    getFromRecord(tokenRecord, "website_url") ??
      getFromRecord(metadata, "website_url") ??
      getFromRecord(metadata, "website") ??
      getFromRecord(metadata, "project_url") ??
      getFromRecord(metadataLinks, "website")
  );

  const twitterUrl = normalizeUrl(
    getFromRecord(tokenRecord, "twitter_url") ??
      getFromRecord(metadata, "twitter_url") ??
      getFromRecord(metadata, "twitter") ??
      getFromRecord(metadata, "x_url") ??
      getFromRecord(metadata, "x") ??
      getFromRecord(metadataLinks, "twitter") ??
      getFromRecord(metadataLinks, "x")
  );

  const githubUrl = normalizeUrl(
    getFromRecord(tokenRecord, "github_url") ??
      getFromRecord(metadata, "github_url") ??
      getFromRecord(metadata, "github") ??
      getFromRecord(metadataLinks, "github")
  );

  const links: TokenLinkItem[] = [];
  if (ideaUrl) links.push({ label: "Test Idea", url: ideaUrl });
  if (websiteUrl) links.push({ label: "Website", url: websiteUrl });
  if (twitterUrl) links.push({ label: "X", url: twitterUrl });
  if (githubUrl) links.push({ label: "GitHub", url: githubUrl });
  return links.slice(0, 3);
}

export default function TokenCard({ token, viewMode }: TokenCardProps) {
  const tradeUrl = getTradeUrl(token.token_layer_id);
  const priceChange = token.price_change_24h_percent;
  const isPositive = priceChange !== null && priceChange >= 0;
  const tokenLinks = getTokenLinks(token);

  if (viewMode === "list") {
    return (
      <div className="group bg-[#0a0f1a]/92 border border-[rgba(136,146,176,0.08)] rounded-xl p-4 hover:border-[rgba(136,146,176,0.2)] hover:bg-[#0d121c] transition-all duration-200">
        <div className="flex items-center gap-4">
          {/* Token Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-10 h-10 flex-shrink-0">
              {token.logo ? (
                <Image
                  src={token.logo}
                  alt={token.name}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-[#ff4d4d] font-bold text-sm">
                  {token.symbol.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[#f0f4ff] truncate text-sm">
                  {token.name}
                </h3>
                {token.token_layer_id && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-[#00e5cc]/10 text-[#00e5cc] rounded font-medium">
                    Live
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-[#5a6480]">${token.symbol}</p>
                <div className="flex items-center gap-1">
                  {token.token_addresses.slice(0, 4).map((addr) => (
                    <div key={addr.id} className="relative group/icon">
                      <ChainIcon chain={addr.chain} isRegistered={addr.is_registered} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#1a2332] border border-[rgba(136,146,176,0.2)] rounded-lg opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all duration-150 pointer-events-none z-50 whitespace-nowrap">
                        <span className={`text-xs font-medium ${addr.is_registered ? "text-[#f0f4ff]" : "text-[#fbbf24]"}`}>
                          {addr.is_registered ? addr.chain : "Awaiting graduation"}
                        </span>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a2332]" />
                      </div>
                    </div>
                  ))}
                  {token.token_addresses.length > 4 && (
                    <span className="text-[10px] text-[#5a6480]">
                      +{token.token_addresses.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-8 text-sm">
            <div className="w-24 text-right">
              <p className="text-[#f0f4ff] font-medium">{formatPrice(token.price)}</p>
            </div>
            <div className="w-20 text-right">
              <p className={`font-medium ${isPositive ? "text-[#00e5cc]" : "text-[#ff4d4d]"}`}>
                {formatPercentage(priceChange)}
              </p>
            </div>
            <div className="w-24 text-right">
              <p className="text-[#8892b0]">${formatNumber(token.market_cap)}</p>
            </div>
            <div className="w-20 text-right">
              <p className="text-[#8892b0]">${formatNumber(token.volume_24h)}</p>
            </div>
          </div>

          {/* Trade Button */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2">
              {tokenLinks[0] && (
                <a
                  href={tokenLinks[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 text-xs font-medium text-[#00e5cc] hover:text-[#5ff4e1] border border-[rgba(0,229,204,0.25)] rounded-lg transition-colors"
                >
                  {tokenLinks[0].label}
                </a>
              )}
              {tradeUrl ? (
                <a
                  href={tradeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#f0f4ff] bg-[#111827] hover:bg-[#1a2332] border border-[rgba(136,146,176,0.15)] hover:border-[rgba(0,229,204,0.3)] rounded-lg transition-all duration-200"
                >
                  Trade
                  <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <span className="inline-flex items-center px-4 py-2 text-sm text-[#5a6480] bg-[#111827]/80 rounded-lg">
                  Soon
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-[#0a0f1a]/92 border border-[rgba(136,146,176,0.08)] rounded-2xl overflow-hidden hover:border-[rgba(136,146,176,0.2)] hover:bg-[#0d121c] transition-all duration-200">
      {/* Token Header */}
      <div className="p-5 flex items-center gap-4">
        <div className="relative w-12 h-12 flex-shrink-0">
          {token.logo ? (
            <Image
              src={token.logo}
              alt={token.name}
              fill
              className="rounded-xl object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#111827] flex items-center justify-center text-[#ff4d4d] font-bold text-lg">
              {token.symbol.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#f0f4ff] truncate">{token.name}</h3>
            {token.token_layer_id && (
              <span className="px-1.5 py-0.5 text-[10px] bg-[#00e5cc]/10 text-[#00e5cc] rounded font-medium">
                Live
              </span>
            )}
          </div>
          <p className="text-sm text-[#5a6480]">${token.symbol}</p>
        </div>
      </div>

      {/* Token Stats */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[#5a6480] mb-1">Price</p>
          <p className="text-sm font-medium text-[#f0f4ff]">
            {formatPrice(token.price)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5a6480] mb-1">24h</p>
          <p
            className={`text-sm font-medium ${
              isPositive ? "text-[#00e5cc]" : "text-[#ff4d4d]"
            }`}
          >
            {formatPercentage(priceChange)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5a6480] mb-1">MCap</p>
          <p className="text-sm font-medium text-[#f0f4ff]">
            ${formatNumber(token.market_cap)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#5a6480] mb-1">Vol 24h</p>
          <p className="text-sm font-medium text-[#f0f4ff]">
            ${formatNumber(token.volume_24h)}
          </p>
        </div>
      </div>

      {/* Chains */}
      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-2">
          {token.token_addresses.slice(0, 6).map((addr) => (
            <ChainBadge
              key={addr.id}
              chain={addr.chain}
              isRegistered={addr.is_registered}
            />
          ))}
          {token.token_addresses.length > 6 && (
            <span className="px-2 py-1 text-[10px] bg-[#111827]/80 text-[#5a6480] rounded">
              +{token.token_addresses.length - 6}
            </span>
          )}
        </div>
      </div>

      {tokenLinks.length > 0 && (
        <div className="px-5 pb-4">
          <div className="flex flex-wrap gap-2">
            {tokenLinks.map((link) => (
              <a
                key={`${token.id}-${link.label}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2.5 py-1.5 text-[11px] font-medium text-[#00e5cc] border border-[rgba(0,229,204,0.2)] rounded-lg hover:text-[#5ff4e1] hover:border-[rgba(0,229,204,0.35)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Trade Button */}
      <div className="p-4 pt-0">
        {tradeUrl ? (
          <a
            href={tradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-sm font-medium text-[#f0f4ff] bg-[#111827] hover:bg-[#1a2332] border border-[rgba(136,146,176,0.15)] hover:border-[rgba(0,229,204,0.3)] rounded-xl transition-all duration-200"
          >
            Trade
            <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ) : (
          <button
            disabled
            className="block w-full py-2.5 px-4 text-sm text-[#5a6480] bg-[#111827]/70 rounded-xl cursor-not-allowed"
          >
            Coming Soon
          </button>
        )}
      </div>
    </div>
  );
}
