"use client";

import { useState, useEffect, useCallback } from "react";
import TokenCard from "./TokenCard";
import { Token, FilterType, GetTokensResponse } from "@/types/token";

type ViewMode = "grid" | "list";
type SortOption = "created_at" | "volume_24h" | "market_cap" | "price_change_24h" | "holders";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "created_at", label: "Newest" },
  { value: "volume_24h", label: "Volume 24h" },
  { value: "market_cap", label: "Market Cap" },
  { value: "price_change_24h", label: "Price Change" },
  { value: "holders", label: "Holders" },
];

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

interface TokenGridProps {
  title?: string;
  description?: string;
  sectionId?: string;
}

export default function TokenGrid({
  title = "Agent Tokens",
  description,
  sectionId,
}: TokenGridProps) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortOption>("created_at");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchTokens = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        setError(null);

        const currentOffset = reset ? 0 : offset;

        const response = await fetch("/api/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filter, sortBy, limit, offset: currentOffset }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tokens");
        }

        const data: GetTokensResponse = await response.json();

        if (reset) {
          setTokens(data.tokens);
          setOffset(limit);
        } else {
          setTokens((prev) => [...prev, ...data.tokens]);
          setOffset((prev) => prev + limit);
        }

        setHasMore(data.pagination.has_more);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [filter, sortBy, offset]
  );

  useEffect(() => {
    fetchTokens(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy]);

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setOffset(0);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setOffset(0);
  };

  const hasDescription = typeof description === "string" && description.length > 0;

  return (
    <section id={sectionId} className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2
                className="text-2xl md:text-3xl font-bold text-[#f0f4ff]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {title}
              </h2>
              {hasDescription && (
                <p className="text-sm text-[#8892b0] mt-1">{description}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-[#0a0f1a] border border-[rgba(136,146,176,0.1)] rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-[#111827] text-[#f0f4ff]"
                      : "text-[#5a6480] hover:text-[#8892b0]"
                  }`}
                  aria-label="Grid view"
                >
                  <GridIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-[#111827] text-[#f0f4ff]"
                      : "text-[#5a6480] hover:text-[#8892b0]"
                  }`}
                  aria-label="List view"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="bg-[#0a0f1a] border border-[rgba(136,146,176,0.1)] rounded-lg px-3 py-2 text-[#f0f4ff] text-sm focus:outline-none focus:border-[rgba(0,229,204,0.3)] cursor-pointer appearance-none pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235a6480'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "16px",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Filter Dropdown */}
              <select
                id="filter"
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value as FilterType)}
                className="bg-[#0a0f1a] border border-[rgba(136,146,176,0.1)] rounded-lg px-3 py-2 text-[#f0f4ff] text-sm focus:outline-none focus:border-[rgba(0,229,204,0.3)] cursor-pointer appearance-none pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235a6480'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  backgroundSize: "16px",
                }}
              >
                <option value="all">All Tokens</option>
                <option value="graduated">Graduated</option>
                <option value="bonding_curve">Bonding Curve</option>
              </select>
            </div>
          </div>
        </div>

        {/* List view header */}
        {viewMode === "list" && tokens.length > 0 && (
          <div className="hidden sm:flex items-center gap-4 px-4 py-3 text-xs text-[#5a6480] uppercase tracking-wider border-b border-[rgba(136,146,176,0.08)] mb-2">
            <div className="flex-1">Token</div>
            <div className="flex items-center gap-8">
              <div className="w-24 text-right">Price</div>
              <div className="w-20 text-right">24h</div>
              <div className="w-24 text-right">MCap</div>
              <div className="w-20 text-right">Vol 24h</div>
            </div>
            <div className="w-24"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-[#991b1b]/10 border border-[#ff4d4d]/20 rounded-xl p-4 mb-8">
            <p className="text-[#ff4d4d] text-sm">{error}</p>
            <button
              onClick={() => fetchTokens(true)}
              className="mt-2 text-xs text-[#f0f4ff] hover:text-[#00e5cc] transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State (Initial) */}
        {loading && tokens.length === 0 && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-2"}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`bg-[#0a0f1a]/50 border border-[rgba(136,146,176,0.08)] rounded-xl animate-pulse ${
                  viewMode === "grid" ? "h-72" : "h-16"
                }`}
              />
            ))}
          </div>
        )}

        {/* Token Grid/List */}
        {tokens.length > 0 && (
          <>
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-2"
            }>
              {tokens.map((token) => (
                <TokenCard key={token.id} token={token} viewMode={viewMode} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={() => fetchTokens(false)}
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-medium text-[#8892b0] hover:text-[#f0f4ff] bg-[#0a0f1a] border border-[rgba(136,146,176,0.1)] hover:border-[rgba(136,146,176,0.2)] rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && tokens.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-[#5a6480] text-sm">No tokens found</p>
          </div>
        )}
      </div>
    </section>
  );
}
