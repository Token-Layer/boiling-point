"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import LaunchCoinModal from "./LaunchCoinModal";
import GlitchText from "./GlitchText";

type Campaign = {
  id: string;
  name: string;
  creator: string;
  logoUrl?: string;
  tokenLayerId: string;
  pitch: string;
  launchChain: "ethereum" | "base";
  targetUsd: number;
  raisedUsd: number;
  volume24hUsd: number;
  change24hPercent: number;
  priceUsd: number;
  marketCapUsd: number;
  backers: number;
  tags: string[];
  status: "new" | "graduating" | "graduated";
  destinationChains: string[];
  demoUrl: string;
  xUrl?: string;
  githubUrl?: string;
  discordUrl?: string;
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "memory-lane",
    name: "Memory Lane",
    creator: "@vibearch",
    tokenLayerId: "memory-lane",
    pitch: "AI memory companion for founders shipping 7-day build sprints.",
    launchChain: "ethereum",
    targetUsd: 25000,
    raisedUsd: 18750,
    volume24hUsd: 68400,
    change24hPercent: 6.8,
    priceUsd: 0.0142,
    marketCapUsd: 423000,
    backers: 214,
    tags: ["AI", "Productivity", "Founder Tools"],
    status: "graduating",
    destinationChains: ["solana", "bnb", "base"],
    demoUrl: "https://openclaw.ai",
    xUrl: "https://x.com/BoilingPoint_tl",
    githubUrl: "https://github.com/Token-Layer/openclaw-launchpad",
  },
  {
    id: "tasksmith",
    name: "Tasksmith",
    creator: "@nofileleft",
    tokenLayerId: "tasksmith",
    pitch: "Voice-first task agent that writes and executes tiny workflow scripts.",
    launchChain: "base",
    targetUsd: 25000,
    raisedUsd: 9200,
    volume24hUsd: 17900,
    change24hPercent: -3.2,
    priceUsd: 0.0048,
    marketCapUsd: 126000,
    backers: 83,
    tags: ["Voice", "Automation", "Productivity"],
    status: "new",
    destinationChains: ["base"],
    demoUrl: "https://openclaw.ai",
    discordUrl: "https://discord.com",
  },
  {
    id: "echo-rangers",
    name: "Echo Rangers",
    creator: "@agentgarden",
    tokenLayerId: "echo-rangers",
    pitch: "A social copilot that turns clips into auto-published narrative threads.",
    launchChain: "ethereum",
    targetUsd: 25000,
    raisedUsd: 24100,
    volume24hUsd: 112600,
    change24hPercent: 12.4,
    priceUsd: 0.0215,
    marketCapUsd: 612000,
    backers: 302,
    tags: ["Social", "AI", "Content"],
    status: "graduated",
    destinationChains: ["solana", "bnb", "base"],
    demoUrl: "https://openclaw.ai",
    xUrl: "https://x.com/BoilingPoint_tl",
    githubUrl: "https://github.com/Token-Layer/openclaw-launchpad",
    discordUrl: "https://discord.com",
  },
];

const UPCOMING_LAUNCHES = [
  {
    id: "signalforge",
    name: "SignalForge",
    creator: "@macrocat",
    eta: "in 7h",
    launchChain: "ethereum",
    ideaUrl: "https://openclaw.ai",
  },
  {
    id: "driftpilot",
    name: "DriftPilot",
    creator: "@shipship",
    eta: "in 1d",
    launchChain: "base",
    ideaUrl: "https://openclaw.ai",
  },
  {
    id: "meshroom",
    name: "Meshroom",
    creator: "@agencyzero",
    eta: "in 2d",
    launchChain: "ethereum",
    ideaUrl: "https://openclaw.ai",
  },
];

const CHAIN_ICONS: Record<string, string> = {
  base: "/images/icons/base.svg",
  ethereum: "/images/icons/ethereum.svg",
  solana: "/images/icons/solana.svg",
  bnb: "/images/icons/bnb.svg",
  monad: "/images/icons/monad.svg",
  polygon: "/images/icons/polygon.svg",
};

const LIVE_CAMPAIGN_TAGS = Array.from(new Set(CAMPAIGNS.flatMap((campaign) => campaign.tags)));
const STATUS_FILTERS = ["all", "new", "graduating", "graduated"] as const;
const STATUS_PRIORITY: Record<Campaign["status"], number> = {
  graduating: 0,
  new: 1,
  graduated: 2,
};
const ORBIT_NODE_BASE_SCALE: Record<(typeof ORBIT_CHAINS)[number]["chain"], number> = {
  solana: 1.12,
  bnb: 1,
  base: 1.18,
  monad: 0.94,
  polygon: 1.04,
};
const ORBIT_CHAINS: Array<{ chain: "solana" | "bnb" | "base" | "monad" | "polygon"; x: number; y: number }> = [
  { chain: "polygon", x: 50, y: 16 },
  { chain: "bnb", x: 82, y: 39 },
  { chain: "monad", x: 69, y: 78 },
  { chain: "base", x: 31, y: 78 },
  { chain: "solana", x: 18, y: 39 },
];

function formatCompactUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getChainLabel(chain: string) {
  const labels: Record<string, string> = {
    bnb: "BNB",
  };
  return labels[chain] ?? chain.charAt(0).toUpperCase() + chain.slice(1);
}

function getTradeUrl(tokenLayerId: string) {
  return `https://app.tokenlayer.network/token/${tokenLayerId}`;
}

function ChainPill({ chain }: { chain: string }) {
  const iconPath = CHAIN_ICONS[chain];

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#111827]/70 border border-[rgba(136,146,176,0.15)] rounded-lg text-xs text-[#8892b0] capitalize">
      {iconPath && <Image src={iconPath} alt={chain} width={14} height={14} className="w-3.5 h-3.5" />}
      {getChainLabel(chain)}
    </span>
  );
}

function ChainOrbit() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerTargetRef = useRef<{ x: number; y: number } | null>(null);
  const pointerCurrentRef = useRef<{ x: number; y: number } | null>(null);
  const nodesRef = useRef(
    ORBIT_CHAINS.map((node) => ({
      chain: node.chain,
      x: node.x / 100,
      y: node.y / 100,
      isMagnetized: false,
      scale: ORBIT_NODE_BASE_SCALE[node.chain],
    }))
  );
  const nodeElementRefs = useRef<Array<HTMLDivElement | null>>([]);
  const lineBaseRefs = useRef<Array<SVGLineElement | null>>([]);
  const lineFlowInRefs = useRef<Array<SVGLineElement | null>>([]);
  const lineFlowOutRefs = useRef<Array<SVGLineElement | null>>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    nodesRef.current.forEach((node, index) => {
      const nodeEl = nodeElementRefs.current[index];
      if (nodeEl) {
        const width = container.clientWidth || 320;
        const height = container.clientHeight || 320;
        nodeEl.style.transform = `translate3d(${(node.x * width).toFixed(2)}px, ${(node.y * height).toFixed(2)}px, 0) translate(-50%, -50%) scale(${node.scale})`;
      }

      const x2 = `${(node.x * 100).toFixed(3)}%`;
      const y2 = `${(node.y * 100).toFixed(3)}%`;
      const baseLine = lineBaseRefs.current[index];
      const flowInLine = lineFlowInRefs.current[index];
      const flowOutLine = lineFlowOutRefs.current[index];

      if (baseLine) {
        baseLine.setAttribute("x2", x2);
        baseLine.setAttribute("y2", y2);
      }
      if (flowInLine) {
        flowInLine.setAttribute("x2", x2);
        flowInLine.setAttribute("y2", y2);
      }
      if (flowOutLine) {
        flowOutLine.setAttribute("x2", x2);
        flowOutLine.setAttribute("y2", y2);
      }
    });
  }, []);

  useEffect(() => {
    let frameId = 0;
    const startedAt = performance.now();
    let previousTime = startedAt;

    const tick = (now: number) => {
      const container = containerRef.current;
      if (!container) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.05, (now - previousTime) / 1000);
      previousTime = now;

      const width = container.clientWidth || 320;
      const height = container.clientHeight || 320;
      const pointerTarget = pointerTargetRef.current;
      const pointerLerp = 1 - Math.exp(-dt * 11);
      const nodeLerp = 1 - Math.exp(-dt * 8.5);
      const scaleLerp = 1 - Math.exp(-dt * 7.5);

      if (pointerTarget) {
        if (!pointerCurrentRef.current) {
          pointerCurrentRef.current = { ...pointerTarget };
        } else {
          pointerCurrentRef.current.x += (pointerTarget.x - pointerCurrentRef.current.x) * pointerLerp;
          pointerCurrentRef.current.y += (pointerTarget.y - pointerCurrentRef.current.y) * pointerLerp;
        }
      } else {
        pointerCurrentRef.current = null;
      }

      const pointer = pointerCurrentRef.current;
      const baseNodes = ORBIT_CHAINS.map((node) => ({
        chain: node.chain,
        baseX: (node.x / 100) * width,
        baseY: (node.y / 100) * height,
      }));

      const nearestSet = new Set<string>();
      if (pointer) {
        baseNodes
          .map((node) => ({
            chain: node.chain,
            distance: Math.hypot(pointer.x - node.baseX, pointer.y - node.baseY),
          }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2)
          .forEach((node) => nearestSet.add(node.chain));
      }

      const attractionRadius = Math.min(width, height) * 0.62;
      const maxOffset = Math.min(width, height) * 0.16;
      const elapsed = (now - startedAt) / 1000;

      nodesRef.current = nodesRef.current.map((node, index) => {
        const baseNode = baseNodes[index];
        let targetX = baseNode.baseX;
        let targetY = baseNode.baseY;
        const isMagnetized = !!pointer && nearestSet.has(node.chain);
        const driftX = Math.sin(elapsed * 0.58 + index * 1.2) * 4.8;
        const driftY = Math.cos(elapsed * 0.5 + index * 1.35) * 3.9;
        targetX += driftX;
        targetY += driftY;

        if (pointer && isMagnetized) {
          const dx = pointer.x - baseNode.baseX;
          const dy = pointer.y - baseNode.baseY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < attractionRadius) {
            const strength = Math.pow(1 - distance / attractionRadius, 2.1);
            const pullFactor = (maxOffset / attractionRadius) * strength;
            targetX += dx * pullFactor;
            targetY += dy * pullFactor;
          }
        }

        const currentX = node.x * width;
        const currentY = node.y * height;
        const nextX = currentX + (targetX - currentX) * nodeLerp;
        const nextY = currentY + (targetY - currentY) * nodeLerp;
        const breathe = Math.sin(elapsed * 0.78 + index * 1.05) * 0.06;
        const targetScale = ORBIT_NODE_BASE_SCALE[node.chain] + breathe + (isMagnetized ? 0.04 : 0);
        const nextScale = node.scale + (targetScale - node.scale) * scaleLerp;

        return {
          ...node,
          x: nextX / width,
          y: nextY / height,
          isMagnetized,
          scale: nextScale,
        };
      });

      nodesRef.current.forEach((node, index) => {
        const nodeEl = nodeElementRefs.current[index];
        if (nodeEl) {
          nodeEl.style.transform = `translate3d(${(node.x * width).toFixed(2)}px, ${(node.y * height).toFixed(2)}px, 0) translate(-50%, -50%) scale(${node.scale})`;
          nodeEl.style.borderColor = node.isMagnetized
            ? "rgba(127,168,255,0.5)"
            : "rgba(136,146,176,0.25)";
        }

        const x2 = `${(node.x * 100).toFixed(3)}%`;
        const y2 = `${(node.y * 100).toFixed(3)}%`;

        const baseLine = lineBaseRefs.current[index];
        const flowInLine = lineFlowInRefs.current[index];
        const flowOutLine = lineFlowOutRefs.current[index];

        if (baseLine) {
          baseLine.setAttribute("x2", x2);
          baseLine.setAttribute("y2", y2);
        }
        if (flowInLine) {
          flowInLine.setAttribute("x2", x2);
          flowInLine.setAttribute("y2", y2);
        }
        if (flowOutLine) {
          flowOutLine.setAttribute("x2", x2);
          flowOutLine.setAttribute("y2", y2);
        }
      });

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex-shrink-0 rounded-2xl border border-[rgba(127,168,255,0.35)] bg-[radial-gradient(circle_at_center,rgba(127,168,255,0.18),rgba(10,15,26,0.9)_58%)] overflow-hidden shadow-[0_0_36px_-22px_rgba(127,168,255,0.9)]"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        pointerTargetRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }}
      onMouseLeave={() => {
        pointerTargetRef.current = null;
      }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {ORBIT_CHAINS.map((node, index) => (
          <g key={`line-${node.chain}`}>
            <line
              ref={(el) => {
                lineBaseRefs.current[index] = el;
              }}
              x1="50%"
              y1="50%"
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="rgba(127,168,255,0.35)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <line
              ref={(el) => {
                lineFlowInRefs.current[index] = el;
              }}
              x1="50%"
              y1="50%"
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="rgba(0,229,204,0.5)"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeDasharray="3 11"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;-28"
                dur="1.7s"
                repeatCount="indefinite"
              />
            </line>
            <line
              ref={(el) => {
                lineFlowOutRefs.current[index] = el;
              }}
              x1="50%"
              y1="50%"
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="rgba(127,168,255,0.42)"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray="2 12"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="-24;0"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </line>
          </g>
        ))}
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 group/eth">
        <div className="w-20 h-20 rounded-3xl border border-[rgba(127,168,255,0.55)] bg-[#0b1424] shadow-[0_0_34px_-10px_rgba(127,168,255,0.9)] flex items-center justify-center">
          <Image src={CHAIN_ICONS.ethereum} alt="Ethereum" width={44} height={44} className="w-11 h-11" />
        </div>
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-md border border-[rgba(136,146,176,0.25)] bg-[#111827] text-[11px] text-[#f0f4ff] opacity-0 group-hover/eth:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Ethereum
        </div>
      </div>

      {ORBIT_CHAINS.map((node, index) => (
        <div
          key={node.chain}
          ref={(el) => {
            nodeElementRefs.current[index] = el;
          }}
          className="absolute z-30 group will-change-transform"
          style={{
            left: "0px",
            top: "0px",
            transform: `translate3d(${((node.x / 100) * 320).toFixed(2)}px, ${((node.y / 100) * 320).toFixed(2)}px, 0) translate(-50%, -50%) scale(${ORBIT_NODE_BASE_SCALE[node.chain]})`,
          }}
        >
          <div className="w-14 h-14 rounded-2xl border border-[rgba(136,146,176,0.25)] bg-[#101a2f] flex items-center justify-center shadow-[0_10px_34px_-18px_rgba(127,168,255,0.95)] transition-colors duration-200">
            <Image src={CHAIN_ICONS[node.chain]} alt={getChainLabel(node.chain)} width={28} height={28} className="w-7 h-7" />
          </div>
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md border border-[rgba(136,146,176,0.25)] bg-[#111827] text-[11px] text-[#f0f4ff] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {getChainLabel(node.chain)}
          </div>
        </div>
      ))}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = Math.min(100, Math.round((campaign.raisedUsd / campaign.targetUsd) * 100));
  const isPositive24h = campaign.change24hPercent >= 0;
  const tradeUrl = getTradeUrl(campaign.tokenLayerId);
  const initials = campaign.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusTone: Record<Campaign["status"], string> = {
    new: "bg-[#60a5fa]/10 text-[#93c5fd] border-[rgba(147,197,253,0.28)]",
    graduating: "bg-[#f59e0b]/10 text-[#fbbf24] border-[rgba(251,191,36,0.3)]",
    graduated: "bg-[#00e5cc]/10 text-[#00e5cc] border-[rgba(0,229,204,0.25)]",
  };

  return (
    <article className="glitch-card rounded-2xl bg-[#0a0f1a]/80 border border-[rgba(136,146,176,0.12)] p-5 hover:border-[rgba(0,229,204,0.28)] transition-colors duration-200">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-[rgba(136,146,176,0.2)] bg-[#111827] flex items-center justify-center text-[11px] font-semibold text-[#f0f4ff] flex-shrink-0">
            {campaign.logoUrl ? (
              <Image
                src={campaign.logoUrl}
                alt={`${campaign.name} logo`}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[#f0f4ff] font-semibold text-lg truncate">
              <GlitchText
                text={campaign.name}
                className="inline-block"
                triggerOnParentClass="glitch-card"
              />
            </p>
            <p className="text-[#5a6480] text-xs mt-0.5">by {campaign.creator}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-wider border ${statusTone[campaign.status]}`}>
          {campaign.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-[#8892b0]">{campaign.pitch}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {campaign.tags.map((tag) => (
          <span
            key={`${campaign.id}-${tag}`}
            className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] text-[#7fa8ff] bg-[#7fa8ff]/10 border border-[rgba(127,168,255,0.2)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-[#8892b0]">Curve Progress</span>
          <span className="text-[#f0f4ff]">{progress}%</span>
        </div>
        <div className="relative h-2 rounded-full bg-[#111827] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#29b6f6] via-[#7a8ca4] to-[#ff4d4d]" />
          <div
            className="absolute top-0 right-0 h-full bg-[#111827]"
            style={{ width: `${100 - progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[#5a6480] text-xs">Price</p>
          <p className="text-[#f0f4ff] font-medium">${campaign.priceUsd.toFixed(4)}</p>
        </div>
        <div>
          <p className="text-[#5a6480] text-xs">Market Cap</p>
          <p className="text-[#f0f4ff] font-medium">{formatCompactUsd(campaign.marketCapUsd)}</p>
        </div>
        <div>
          <p className="text-[#5a6480] text-xs">24h Volume</p>
          <p className="text-[#f0f4ff] font-medium">{formatCompactUsd(campaign.volume24hUsd)}</p>
        </div>
        <div>
          <p className="text-[#5a6480] text-xs">24h Change</p>
          <p className={`font-medium ${isPositive24h ? "text-[#00e5cc]" : "text-[#ff4d4d]"}`}>
            {isPositive24h ? "+" : ""}
            {campaign.change24hPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-[#5a6480] text-xs">{campaign.backers} backers</p>
          <div className="flex items-center gap-2">
            {campaign.xUrl && (
              <a
                href={campaign.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5a6480] hover:text-[#f0f4ff] transition-colors"
                aria-label={`${campaign.name} on X`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            )}
            {campaign.githubUrl && (
              <a
                href={campaign.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5a6480] hover:text-[#f0f4ff] transition-colors"
                aria-label={`${campaign.name} on GitHub`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12a12 12 0 008.207 11.387c.6.111.793-.261.793-.577v-2.042c-3.338.726-4.033-1.417-4.033-1.417-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.236 1.839 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.304-5.466-1.333-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.009-.323 3.301 1.23A11.52 11.52 0 0112 6.844c1.02.005 2.047.138 3.006.404 2.291-1.553 3.3-1.23 3.3-1.23.653 1.653.242 2.874.118 3.176.77.84 1.236 1.91 1.236 3.22 0 4.61-2.804 5.628-5.475 5.927.429.37.823 1.102.823 2.222v3.293c0 .319.192.69.8.577A12.001 12.001 0 0024 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            )}
            {campaign.discordUrl && (
              <a
                href={campaign.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5a6480] hover:text-[#f0f4ff] transition-colors"
                aria-label={`${campaign.name} on Discord`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.369A19.791 19.791 0 0015.417 3c-.211.375-.444.88-.608 1.274a18.27 18.27 0 00-5.618 0A12.64 12.64 0 008.583 3a19.736 19.736 0 00-4.9 1.369C.533 9.02-.32 13.579.099 18.077A19.916 19.916 0 006.115 21c.486-.66.918-1.36 1.286-2.095a12.935 12.935 0 01-2.024-.974c.17-.124.336-.255.497-.39 3.905 1.835 8.145 1.835 12.004 0 .162.135.327.266.497.39a12.86 12.86 0 01-2.026.975c.368.734.8 1.434 1.286 2.094A19.89 19.89 0 0023.9 18.077c.497-5.208-.85-9.725-3.583-13.708zM8.02 15.331c-1.182 0-2.152-1.085-2.152-2.419 0-1.334.95-2.418 2.152-2.418 1.21 0 2.171 1.094 2.152 2.418 0 1.334-.95 2.419-2.152 2.419zm7.96 0c-1.182 0-2.152-1.085-2.152-2.419 0-1.334.95-2.418 2.152-2.418 1.21 0 2.171 1.094 2.152 2.418 0 1.334-.942 2.419-2.152 2.419z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={campaign.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-[#00e5cc] hover:text-[#5ff4e1] transition-colors"
          >
            Demo
          </a>
          <a
            href={tradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-[#f0f4ff] bg-[#111827] border border-[rgba(136,146,176,0.2)] hover:border-[rgba(0,229,204,0.35)] hover:text-[#00e5cc] transition-colors"
          >
            Trade
          </a>
        </div>
      </div>
    </article>
  );
}

export default function LaunchpadOverview() {
  const [selectedLiveTag, setSelectedLiveTag] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const filteredCampaigns = useMemo(() => {
    return CAMPAIGNS
      .filter((campaign) => {
        if (selectedStatus !== "all" && campaign.status !== selectedStatus) return false;
        if (selectedLiveTag !== "All" && !campaign.tags.includes(selectedLiveTag)) return false;
        return true;
      })
      .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);
  }, [selectedLiveTag, selectedStatus]);

  return (
    <section className="relative pt-12 pb-4 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[520px] bg-[#00e5cc] opacity-[0.07] blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-12 right-0 w-[420px] h-[300px] bg-[#ff4d4d] opacity-[0.08] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto space-y-8">
        <div className="rounded-3xl border border-[rgba(136,146,176,0.16)] bg-gradient-to-br from-[#0a0f1a] via-[#111827] to-[#0a0f1a] p-7 md:p-9">
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-6">
            <div className="max-w-3xl flex flex-col gap-6 lg:gap-0 lg:justify-between lg:min-h-[320px]">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#ff4d4d] font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  The Boiling Point
                </p>
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#f0f4ff]" style={{ fontFamily: "var(--font-display)" }}>
                  Back to Ethereum. Back to belief.
                </h1>
                <p className="mt-4 text-[#8892b0] max-w-2xl">
                  Strangers once funded revolutions here. Now they fund you — $10k at a time.
                </p>
              </div>
              <div>
                <p className="text-sm text-[#9aa6c7] font-medium md:max-w-2xl">
                  Ethereum at the core. Powered by the crowd. Everywhere at once.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <LaunchCoinModal />
                  <a
                    href="#recently-launched"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#111827] border border-[rgba(136,146,176,0.2)] text-[#f0f4ff] text-sm font-medium hover:border-[rgba(0,229,204,0.35)] transition-colors"
                  >
                    Browse Tokens
                  </a>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-auto flex justify-center lg:justify-end flex-shrink-0">
              <ChainOrbit />
            </div>
          </div>
        </div>

        <div id="upcoming-launches">
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f0f4ff]" style={{ fontFamily: "var(--font-display)" }}>
              Upcoming Launches
            </h2>
            <p className="text-[#8892b0] text-sm mt-1">Preview what is about to go live next.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {UPCOMING_LAUNCHES.map((launch) => (
              <article
                key={launch.id}
                className="glitch-card rounded-2xl bg-[#0a0f1a]/70 border border-[rgba(136,146,176,0.12)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[#f0f4ff] font-semibold">
                      <GlitchText
                        text={launch.name}
                        className="inline-block"
                        triggerOnParentClass="glitch-card"
                      />
                    </p>
                    <p className="text-[#5a6480] text-xs mt-0.5">by {launch.creator}</p>
                  </div>
                  <span className="px-2 py-1 rounded-lg text-[11px] font-medium bg-[#ff4d4d]/10 text-[#ff8a8a] uppercase">
                    {launch.eta}
                  </span>
                </div>
                <div className="mt-3">
                  <ChainPill chain={launch.launchChain} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <a
                    href={launch.ideaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#00e5cc] hover:text-[#5ff4e1] transition-colors"
                  >
                    Demo
                  </a>
                  <button className="text-xs font-medium text-[#f0f4ff] hover:text-[#00e5cc] transition-colors">
                    Remind Me
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div id="live-campaigns">
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f0f4ff]" style={{ fontFamily: "var(--font-display)" }}>
              Live Bonding Curves
            </h2>
            <p className="text-[#8892b0] text-sm mt-1">Tradable now with live price, volume, and momentum.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs border transition-colors ${
                    selectedStatus === status
                      ? "bg-[#00e5cc]/12 text-[#00e5cc] border-[rgba(0,229,204,0.3)]"
                      : "bg-[#111827]/70 text-[#8892b0] border-[rgba(136,146,176,0.2)] hover:text-[#f0f4ff]"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              <span className="mx-1 text-xs text-[#4b556f]">|</span>
              <button
                type="button"
                onClick={() => setSelectedLiveTag("All")}
                className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs border transition-colors ${
                  selectedLiveTag === "All"
                    ? "bg-[#00e5cc]/12 text-[#00e5cc] border-[rgba(0,229,204,0.3)]"
                    : "bg-[#111827]/70 text-[#8892b0] border-[rgba(136,146,176,0.2)] hover:text-[#f0f4ff]"
                }`}
              >
                All
              </button>
              {LIVE_CAMPAIGN_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedLiveTag(tag)}
                  className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs border transition-colors ${
                    selectedLiveTag === tag
                      ? "bg-[#7fa8ff]/12 text-[#9ab8ff] border-[rgba(127,168,255,0.35)]"
                      : "bg-[#111827]/70 text-[#8892b0] border-[rgba(136,146,176,0.2)] hover:text-[#f0f4ff]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
          {filteredCampaigns.length === 0 && (
            <div className="mt-4 rounded-xl border border-[rgba(136,146,176,0.14)] bg-[#0a0f1a]/70 p-4 text-sm text-[#8892b0]">
              No live campaigns match these filters yet.
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[#0a0f1a]/80 p-6">
            <h3 className="text-xl font-semibold text-[#f0f4ff]" style={{ fontFamily: "var(--font-display)" }}>
              Fair Distribution by Default
            </h3>
            <div className="mt-4 space-y-2.5 text-sm text-[#8892b0]">
              <p>1. Trading starts on a bonding curve from launch, with transparent progression.</p>
              <p>2. Graduation thresholds discourage pure first-minute sniper extraction.</p>
              <p>3. Creator economics trigger at graduation and continue via trading fees.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[#0a0f1a]/80 p-6">
            <h3 className="text-xl font-semibold text-[#f0f4ff]" style={{ fontFamily: "var(--font-display)" }}>
              BoilingPoint Economics
            </h3>
            <div className="mt-4 space-y-2.5 text-sm text-[#8892b0]">
              <p>1. Every launcher or trader onboarded via BoilingPoint gets a <span className="text-[#f0f4ff] font-medium">4% discount</span> on trading fees.</p>
              <p>2. BoilingPoint earns Token Layer protocol fees from onboarded users at <span className="text-[#f0f4ff] font-medium">no extra cost</span> to launchers or traders.</p>
              <p>3. Generated fees are directed to <span className="text-[#f0f4ff] font-medium">$BISK buybacks</span>.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(136,146,176,0.14)] bg-[#0a0f1a]/80 p-6 lg:col-span-2">
            <h3 className="text-xl font-semibold text-[#f0f4ff]" style={{ fontFamily: "var(--font-display)" }}>
              Agentic Deployments with ClawHub
            </h3>
            <p className="mt-3 text-sm text-[#8892b0]">
              Campaigns can optionally ship with OpenClaw agent workflows.
            </p>
            <div className="mt-4 rounded-xl bg-[#111827]/80 border border-[rgba(136,146,176,0.2)] px-4 py-3">
              <p className="text-[11px] text-[#5a6480] uppercase tracking-wider">Install via CLI</p>
              <code className="block mt-1 text-[#f0f4ff] text-sm">clawhub install campaign-starter</code>
            </div>
            <a
              href="https://openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-4 text-sm text-[#00e5cc] hover:text-[#5ff4e1] transition-colors"
            >
              Explore ClawHub and agent templates
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
