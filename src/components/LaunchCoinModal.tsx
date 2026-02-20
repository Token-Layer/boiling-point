"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Image from "next/image";

type LaunchFormState = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  imageName: string;
  banner: string;
  bannerName: string;
  video: string;
  chainSlug: string;
  website: string;
  twitter: string;
  youtube: string;
  discord: string;
  telegram: string;
  tags: string;
};

type CreateTokenTransactionResponse = {
  success: boolean;
  metadata?: {
    hubUrl: string;
  };
  error?: string;
};

const LAUNCH_CHAIN = "ethereum";
const HARDCODED_DESTINATION_CHAINS = ["base", "ethereum", "bnb", "solana", "monad"];

const CHAIN_ICONS: Record<string, string> = {
  base: "/images/icons/base.svg",
  ethereum: "/images/icons/ethereum.svg",
  solana: "/images/icons/solana.svg",
  bnb: "/images/icons/bnb.svg",
  monad: "/images/icons/monad.svg",
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
  chainSlug: LAUNCH_CHAIN,
  website: "",
  twitter: "",
  youtube: "",
  discord: "",
  telegram: "",
  tags: "",
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

export default function LaunchCoinModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const [readingBanner, setReadingBanner] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<CreateTokenTransactionResponse | null>(null);
  const [form, setForm] = useState<LaunchFormState>(DEFAULT_FORM);

  const closeModal = () => {
    setIsOpen(false);
    setSubmitting(false);
    setReadingImage(false);
    setError(null);
    setResponse(null);
    setForm(DEFAULT_FORM);
  };

  const chainLabel = (slug: string) =>
    slug.charAt(0).toUpperCase() + slug.slice(1);

  const ChainBadge = ({ slug }: { slug: string }) => (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] text-xs text-[#f0f4ff]">
      {CHAIN_ICONS[slug] && (
        <Image src={CHAIN_ICONS[slug]} alt={slug} width={14} height={14} className="w-3.5 h-3.5" />
      )}
      {chainLabel(slug)}
    </span>
  );

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const links = {
        website: cleanString(form.website),
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
        chainSlug: LAUNCH_CHAIN,
        destinationChains: HARDCODED_DESTINATION_CHAINS,
        poolType: "startup-preseed",
        banner: cleanString(form.banner),
        video: cleanString(form.video),
        links: Object.values(links).some(Boolean) ? links : undefined,
        tags: cleanString(form.tags)?.split(",").map((tag) => tag.trim()).filter(Boolean),
        type: "coin",
      };

      const res = await fetch("/api/tokens/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as CreateTokenTransactionResponse;
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create token transaction.");
      }

      setResponse(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#14b8a6] text-[#041217] text-sm font-semibold hover:brightness-110 transition-all"
      >
        Launch Coin
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
                <div className="block">
                  <span className="text-xs text-[#8892b0]">Launch Chain *</span>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border text-sm bg-[#00e5cc]/15 border-[rgba(0,229,204,0.35)] text-[#00e5cc]">
                      {CHAIN_ICONS[LAUNCH_CHAIN] && (
                        <Image src={CHAIN_ICONS[LAUNCH_CHAIN]} alt={LAUNCH_CHAIN} width={16} height={16} className="w-4 h-4" />
                      )}
                      Ethereum (locked)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                <label className="block">
                  <span className="text-xs text-[#8892b0]">Banner URL</span>
                  <input
                    value={form.banner.startsWith("data:image/") ? "" : form.banner}
                    onChange={(e) => setForm((prev) => ({ ...prev, banner: e.target.value, bannerName: "" }))}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                    placeholder="https://..."
                  />
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

              <div>
                <p className="text-xs text-[#8892b0]">Destination Chains</p>
                <p className="text-[11px] text-[#5a6480] mt-1">Hardcoded route for now.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {HARDCODED_DESTINATION_CHAINS.map((slug) => (
                    <ChainBadge key={slug} slug={slug} />
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-[#8892b0]">Website</span>
                  <input
                    value={form.website}
                    onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                    placeholder="https://example.com"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-[#8892b0]">Twitter/X</span>
                  <input
                    value={form.twitter}
                    onChange={(e) => setForm((prev) => ({ ...prev, twitter: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                    placeholder="https://x.com/..."
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
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

              <label className="block">
                <span className="text-xs text-[#8892b0]">Tags (comma-separated)</span>
                <input
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  className="mt-1 w-full rounded-lg bg-[#111827] border border-[rgba(136,146,176,0.2)] px-3 py-2 text-sm text-[#f0f4ff] focus:outline-none focus:border-[rgba(0,229,204,0.4)]"
                  placeholder="defi,meme,agent"
                />
              </label>

              {error && <p className="text-sm text-[#ff6b6b]">{error}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting || readingImage || readingBanner || !form.image}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00e5cc] to-[#14b8a6] text-[#041217] disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Launch Transaction"}
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
                <p className="text-sm text-[#00e5cc] font-medium">Launch transaction created.</p>
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
        </div>
      )}
    </>
  );
}
