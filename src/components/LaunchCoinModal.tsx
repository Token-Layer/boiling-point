"use client";

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useState } from "react";
import type {
  CreateTokenResult,
  CreateTokenTransaction,
  QuoteTokenInfoResponse,
} from "@token-layer/sdk-typescript";
import { useAccount } from "wagmi";
import TransactionExecutionModal from "@/components/TransactionExecutionModal";
import type {
  CreateTokenEndpointResponse,
  QuoteTokenEndpointResponse,
} from "@/types/token-layer-api";

type LaunchFormState = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  imageName: string;
  banner: string;
  bannerName: string;
  video: string;
  demoLink: string;
  twitter: string;
  youtube: string;
  discord: string;
  telegram: string;
};

const DEFAULT_FORM: LaunchFormState = {
  name: "",
  symbol: "",
  description: "",
  image: "",
  imageName: "",
  banner: "",
  bannerName: "",
  video: "",
  demoLink: "",
  twitter: "",
  youtube: "",
  discord: "",
  telegram: "",
};

function cleanString(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function getQuotedOutputAmount(quote: QuoteTokenInfoResponse | null): number | null {
  if (!quote) return null;
  const amount = quote.data?.outputAmount;
  return Number.isFinite(amount) ? amount : null;
}

function formatTokenAmount(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value);
}

export default function LaunchCoinModal() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const [readingBanner, setReadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CreateTokenResult | null>(null);
  const [form, setForm] = useState<LaunchFormState>(DEFAULT_FORM);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);
  const [showInitialBuyModal, setShowInitialBuyModal] = useState(false);
  const [initialBuyAmount, setInitialBuyAmount] = useState("");
  const [quoteData, setQuoteData] = useState<QuoteTokenInfoResponse | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<CreateTokenTransaction[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [txSummary, setTxSummary] = useState<{
    tokenName: string;
    tokenSymbol: string;
    amountInUsd?: number;
    estimatedTokensOut?: number;
    tokenImage?: string;
  } | null>(null);
  const quotedOutputAmount = getQuotedOutputAmount(quoteData);
  const displayTokenSymbol = form.symbol.trim().toUpperCase() || "TOKEN";

  const closeModal = () => {
    setIsOpen(false);
    setSubmitting(false);
    setQuoting(false);
    setReadingImage(false);
    setReadingBanner(false);
    setError(null);
    setResponse(null);
    setForm(DEFAULT_FORM);
    setSocialsOpen(false);
    setTags([]);
    setTagInput("");
    setPendingPayload(null);
    setShowInitialBuyModal(false);
    setInitialBuyAmount("");
    setQuoteData(null);
    setQuoteError(null);
    setPendingTransactions([]);
    setShowTransactionModal(false);
    setTxSummary(null);
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setReadingImage(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, image: base64, imageName: file.name }));
    } catch (imageError) {
      setError(imageError instanceof Error ? imageError.message : "Failed to load image.");
    } finally {
      setReadingImage(false);
    }
  };

  const handleBannerChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setReadingBanner(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      setForm((prev) => ({ ...prev, banner: base64, bannerName: file.name }));
    } catch (bannerError) {
      setError(bannerError instanceof Error ? bannerError.message : "Failed to load banner.");
    } finally {
      setReadingBanner(false);
    }
  };

  const addTag = (rawValue: string) => {
    const normalized = rawValue.trim().replace(/\s+/g, "-").toLowerCase();
    if (!normalized || tags.includes(normalized)) return;
    setTags((prev) => [...prev, normalized]);
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "," || event.key === "Enter") {
      event.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }

    if (event.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const getTransactionList = (data: CreateTokenResult): CreateTokenTransaction[] => {
    if (Array.isArray(data.transactions)) {
      return data.transactions;
    }
    if (data.transaction && typeof data.transaction === "object") {
      return [data.transaction];
    }
    return [];
  };

  const createTransaction = async (extraPayload?: Record<string, unknown>) => {
    if (!pendingPayload) {
      setError("Missing launch payload. Please try again.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/tokens/create-token-endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pendingPayload,
          ...extraPayload,
        }),
      });

      const data = (await res.json()) as CreateTokenEndpointResponse;
      if (data.success === false) {
        throw new Error(data.error || "Failed to create token transaction.");
      }
      if (!res.ok) {
        throw new Error("Failed to create token transaction.");
      }

      setResponse(data);
      const transactions = getTransactionList(data);
      if (transactions.length > 0) {
        setPendingTransactions(transactions);
        setShowTransactionModal(true);
      } else {
        setPendingTransactions([]);
        setShowTransactionModal(false);
      }
      const amountInRaw =
        typeof extraPayload?.amountIn === "number"
          ? extraPayload.amountIn
          : typeof extraPayload?.amountIn === "string"
            ? Number(extraPayload.amountIn)
            : undefined;
      setTxSummary({
        tokenName: form.name.trim(),
        tokenSymbol: form.symbol.trim().toUpperCase(),
        amountInUsd:
          amountInRaw !== undefined && Number.isFinite(amountInRaw) ? amountInRaw : undefined,
        estimatedTokensOut: quotedOutputAmount ?? undefined,
        tokenImage: form.image || undefined,
      });
      setShowInitialBuyModal(false);
      setPendingPayload(null);
      setInitialBuyAmount("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isConnected || !address) {
      setError("Connect your wallet before creating a launch transaction.");
      return;
    }

    setError(null);
    setResponse(null);

    const links = {
      website: cleanString(form.demoLink),
      twitter: cleanString(form.twitter),
      youtube: cleanString(form.youtube),
      discord: cleanString(form.discord),
      telegram: cleanString(form.telegram),
    };

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      symbol: form.symbol.trim().toUpperCase(),
      description: form.description.trim(),
      image: form.image,
      poolType: "startup-preseed",
      banner: cleanString(form.banner),
      video: cleanString(form.video),
      links: Object.values(links).some(Boolean) ? links : undefined,
      tags: tags.length > 0 ? tags : undefined,
      type: "coin",
      userAddress: address,
    };

    setPendingPayload(payload);
    setInitialBuyAmount("");
    setQuoteData(null);
    setShowInitialBuyModal(true);
  };

  const handleSkipInitialBuy = async () => {
    await createTransaction();
  };

  const fetchQuote = async (amount: number): Promise<QuoteTokenInfoResponse> => {
    setQuoting(true);
    setQuoteError(null);

    try {
      const quoteResponse = await fetch("/api/tokens/quote-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const quoteResult = (await quoteResponse.json()) as QuoteTokenEndpointResponse;
      if (quoteResult.success === false) {
        throw new Error(quoteResult.error || "Failed to quote initial purchase.");
      }
      if (!quoteResponse.ok || !quoteResult.quote) {
        throw new Error("Failed to quote initial purchase.");
      }

      setQuoteData(quoteResult.quote);
      return quoteResult.quote;
    } catch (quoteError) {
      const message =
        quoteError instanceof Error ? quoteError.message : "Failed to quote initial purchase.";
      setQuoteData(null);
      setQuoteError(message);
      throw quoteError;
    } finally {
      setQuoting(false);
    }
  };

  useEffect(() => {
    if (!showInitialBuyModal) return;

    const trimmedAmount = initialBuyAmount.trim();
    if (!trimmedAmount) {
      setQuoteData(null);
      setQuoteError(null);
      return;
    }

    const amount = Number(trimmedAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setQuoteData(null);
      setQuoteError(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      fetchQuote(amount).catch(() => {
        // Error state is already handled in fetchQuote.
      });
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [initialBuyAmount, showInitialBuyModal]);

  const handleBuyAndCreate = async () => {
    const amount = Number(initialBuyAmount.trim());
    if (!Number.isFinite(amount) || amount <= 0) {
      setQuoteError("Enter a valid USDT amount to continue.");
      return;
    }

    setError(null);

    try {
      if (!quoteData) {
        await fetchQuote(amount);
      }
      await createTransaction({
        amountIn: amount,
      });
    } catch (quoteError) {
      if (!(quoteError instanceof Error)) {
        setQuoteError("Failed to quote initial purchase.");
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={!isConnected}
        className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#14b8a6] text-[#041217] text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isConnected ? "Launch Coin" : "Connect Wallet to Launch"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto my-8 rounded-2xl bg-[#0a0f1a] border border-[rgba(136,146,176,0.2)]">
            <div className="flex items-center justify-between p-5 border-b border-[rgba(136,146,176,0.15)]">
              <h2 className="text-2xl text-[#f0f4ff] font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Launch Coin
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-[#8892b0] hover:text-[#f0f4ff] transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <p className="text-xs text-[#9aa6c7]">
                Connected wallet:{" "}
                {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "not connected"}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-[#8892b0]">Token Name *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                    placeholder="My Onchain Idea"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-[#8892b0]">Symbol *</span>
                  <input
                    required
                    maxLength={10}
                    value={form.symbol}
                    onChange={(e) => setForm((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                    placeholder="IDEA"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs text-[#8892b0]">Description *</span>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] h-24 focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                  placeholder="Describe the vibe-coded idea this token represents."
                />
              </label>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-[#8892b0]">Logo Image *</span>
                  <input
                    required
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] file:mr-3 file:border-0 file:bg-[#1a2332] file:text-[#f0f4ff] file:px-3 file:py-1.5 file:rounded-md"
                  />
                  <p className="text-[11px] text-[#5a6480] mt-1">
                    {readingImage ? "Converting image..." : form.imageName || "Upload from your computer."}
                  </p>
                </label>
                <label className="block">
                  <span className="text-xs text-[#8892b0]">Demo Link</span>
                  <input
                    value={form.demoLink}
                    onChange={(e) => setForm((prev) => ({ ...prev, demoLink: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                    placeholder="https://demo.example.com"
                  />
                  <p className="text-[11px] text-[#5a6480] mt-1">Sent as `links.website` in create-token-endpoint.</p>
                </label>
              </div>

              <div className="grid md:grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-xs text-[#8892b0]">Banner Image Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] file:mr-3 file:border-0 file:bg-[#1a2332] file:text-[#f0f4ff] file:px-3 file:py-1.5 file:rounded-md"
                  />
                  <p className="text-[11px] text-[#5a6480] mt-1">
                    {readingBanner ? "Converting banner..." : form.bannerName || "Optional."}
                  </p>
                </label>
              </div>

              <div className="grid md:grid-cols-1 gap-4">
                <label className="block md:max-w-[50%]">
                  <span className="text-xs text-[#8892b0]">Video URL</span>
                  <input
                    value={form.video}
                    onChange={(e) => setForm((prev) => ({ ...prev, video: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                    placeholder="https://..."
                  />
                </label>
              </div>

              <div className="rounded-xl border border-[rgba(136,146,176,0.2)] bg-[#0d1523]">
                <button
                  type="button"
                  onClick={() => setSocialsOpen((prev) => !prev)}
                  className="w-full p-3 flex items-center justify-between text-left"
                >
                  <span className="text-sm text-[#dce6ff]">Social Links</span>
                  <span className="text-xs text-[#8892b0]">{socialsOpen ? "Hide" : "Show"}</span>
                </button>
                {socialsOpen && (
                  <div className="px-3 pb-3 pt-1 grid md:grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs text-[#8892b0]">Twitter/X</span>
                      <input
                        value={form.twitter}
                        onChange={(e) => setForm((prev) => ({ ...prev, twitter: e.target.value }))}
                        className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                        placeholder="https://x.com/..."
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-[#8892b0]">YouTube</span>
                      <input
                        value={form.youtube}
                        onChange={(e) => setForm((prev) => ({ ...prev, youtube: e.target.value }))}
                        className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                        placeholder="https://..."
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-[#8892b0]">Discord</span>
                      <input
                        value={form.discord}
                        onChange={(e) => setForm((prev) => ({ ...prev, discord: e.target.value }))}
                        className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                        placeholder="https://..."
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-[#8892b0]">Telegram</span>
                      <input
                        value={form.telegram}
                        onChange={(e) => setForm((prev) => ({ ...prev, telegram: e.target.value }))}
                        className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                        placeholder="https://..."
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="block">
                <span className="text-xs text-[#8892b0]">Tags</span>
                <div className="mt-1 rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-2.5 py-2 focus-within:border-[rgba(0,229,204,0.4)]">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 bg-[#00e5cc]/15 border border-[rgba(0,229,204,0.35)] text-xs text-[#7cf7ea]"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-[#9bfaf0] hover:text-white leading-none"
                          aria-label={`Remove ${tag}`}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => {
                      addTag(tagInput);
                      setTagInput("");
                    }}
                    className="w-full bg-transparent text-sm text-[#f0f4ff] focus:outline-none"
                    placeholder="Type a tag and press Enter or comma"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting || quoting || readingImage || readingBanner || !form.image || !isConnected}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00e5cc] to-[#14b8a6] text-[#041217] disabled:opacity-60"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-lg text-sm text-[#8892b0] border border-[rgba(136,146,176,0.2)] hover:text-[#f0f4ff]"
                >
                  Cancel
                </button>
              </div>
            </form>

            {response && (
              <div className="mx-5 mb-5 p-4 rounded-xl border border-[rgba(136,146,176,0.2)] bg-[#111827]/60">
                <p className="text-sm text-[#00e5cc] font-medium">
                  {pendingTransactions.length > 0
                    ? "Launch transaction prepared. Complete wallet steps below."
                    : "Launch transaction created."}
                </p>
                {response.metadata?.hubUrl && (
                  <a
                    href={response.metadata.hubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-[#5ff4e1] hover:underline"
                  >
                    Open token hub page
                  </a>
                )}
              </div>
            )}
          </div>

          {showInitialBuyModal && (
            <div className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="max-w-lg mx-auto my-16 rounded-2xl bg-[#0a0f1a] border border-[rgba(136,146,176,0.2)] p-5">
                <h3 className="text-lg text-[#f0f4ff] font-semibold">Optional Initial Buy</h3>
                <p className="mt-2 text-sm text-[#b8c3de]">
                  Optionally purchase initial tokens at launch. You can skip this step and buy later on the token page.
                </p>

                <label className="block mt-4">
                  <span className="text-xs text-[#8892b0]">USDT Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    inputMode="decimal"
                    value={initialBuyAmount}
                    onChange={(e) => {
                      setInitialBuyAmount(e.target.value);
                      setQuoteData(null);
                      setQuoteError(null);
                    }}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                    placeholder="100"
                  />
                  <p className="text-[11px] text-[#5a6480] mt-1">Quote call uses `inputToken: usdc` on Token Layer.</p>
                  {quoting && <p className="text-[11px] text-[#7cf7ea] mt-1">Fetching quote...</p>}
                </label>

                {quotedOutputAmount !== null && (
                  <div className="mt-3 rounded-lg border border-[rgba(0,229,204,0.25)] bg-[#00e5cc]/10 p-3">
                    <p className="text-xs text-[#7cf7ea] font-medium mb-1">Estimated Output</p>
                    <p className="text-sm text-[#c9fff7]">
                      {formatTokenAmount(quotedOutputAmount)} {displayTokenSymbol}
                    </p>
                  </div>
                )}

                {quoteError && <p className="mt-3 text-sm text-[#ff6b6b]">{quoteError}</p>}
                {error && <p className="mt-3 text-sm text-[#ff6b6b]">{error}</p>}

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBuyAndCreate}
                    disabled={submitting || quoting || quotedOutputAmount === null}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00e5cc] to-[#14b8a6] text-[#041217] disabled:opacity-60"
                  >
                    {quoting || submitting ? "Processing..." : "Buy & Launch"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipInitialBuy}
                    disabled={submitting || quoting}
                    className="px-4 py-2.5 rounded-lg text-sm text-[#f0f4ff] border border-[rgba(136,146,176,0.3)] hover:border-[rgba(240,244,255,0.5)] disabled:opacity-60"
                  >
                    Skip and Launch
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInitialBuyModal(false);
                      setError(null);
                    }}
                    disabled={submitting || quoting}
                    className="px-4 py-2.5 rounded-lg text-sm text-[#8892b0] hover:text-[#f0f4ff] disabled:opacity-60"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}

          <TransactionExecutionModal
            isOpen={showTransactionModal}
            transactions={pendingTransactions}
            onClose={() => setShowTransactionModal(false)}
            title="Review Transactions"
            successUrl={response?.metadata?.hubUrl}
            successUrlLabel="Open token page"
            summary={txSummary}
          />
        </div>
      )}
    </>
  );
}
