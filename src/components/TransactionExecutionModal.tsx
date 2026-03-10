"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useSwitchChain, useWalletClient } from "wagmi";

type ApiTransaction = Record<string, unknown>;

type StepStatus = "idle" | "awaiting_wallet" | "submitted" | "confirmed" | "failed";

type Step = {
  id: string;
  label: string;
  transaction: ApiTransaction;
  status: StepStatus;
  hash?: string;
  error?: string;
};

type TransactionExecutionModalProps = {
  isOpen: boolean;
  transactions: ApiTransaction[];
  onClose: () => void;
  title?: string;
  successUrl?: string;
  successUrlLabel?: string;
  summary?: {
    tokenName: string;
    tokenSymbol: string;
    amountInUsd?: number;
    estimatedTokensOut?: number;
    tokenImage?: string;
  } | null;
};

const CHAIN_ICONS: Record<string, string> = {
  abstract: "/images/icons/abstract.svg",
  arbitrum: "/images/icons/arbitrum.svg",
  avalanche: "/images/icons/avalanche.svg",
  base: "/images/icons/base.svg",
  "base-sepolia": "/images/icons/base-sepolia.svg",
  bnb: "/images/icons/bnb.svg",
  "bnb-testnet": "/images/icons/bnb-testnet.svg",
  ethereum: "/images/icons/ethereum.svg",
  monad: "/images/icons/monad.svg",
  polygon: "/images/icons/polygon.svg",
  solana: "/images/icons/solana.svg",
  unichain: "/images/icons/unichain.svg",
  "unichain-testnet": "/images/icons/unichain-testnet.svg",
  zksync: "/images/icons/zksync.svg",
  "zksync-testnet": "/images/icons/zksync.svg",
};

function toBigIntValue(value: unknown): bigint | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    try {
      return BigInt(trimmed);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function toRpcQuantity(value: unknown): `0x${string}` | undefined {
  const parsed = toBigIntValue(value);
  if (parsed === undefined) return undefined;
  return `0x${parsed.toString(16)}` as `0x${string}`;
}

function inferStepLabel(transaction: ApiTransaction, index: number, total: number): string {
  const explicit =
    (typeof transaction.title === "string" && transaction.title) ||
    (typeof transaction.label === "string" && transaction.label) ||
    (typeof transaction.description === "string" && transaction.description);
  if (explicit) return explicit;
  if (total > 1 && index === 0) return "Approve in wallet";
  if (total > 1 && index === total - 1) return "Confirm transaction";
  return `Transaction ${index + 1}`;
}

export default function TransactionExecutionModal({
  isOpen,
  transactions,
  onClose,
  title = "Review Transactions",
  successUrl,
  successUrlLabel = "Open token page",
  summary,
}: TransactionExecutionModalProps) {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [steps, setSteps] = useState<Step[]>([]);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulateOnly, setSimulateOnly] = useState(false);

  useEffect(() => {
    if (!isOpen || transactions.length === 0) return;
    setSteps(
      transactions.map((transaction, index) => ({
        id: `${index}-${Date.now()}`,
        label: inferStepLabel(transaction, index, transactions.length),
        transaction,
        status: "idle",
      }))
    );
    setError(null);
    setExecuting(false);
    setSimulateOnly(false);
  }, [isOpen, transactions]);

  const allConfirmed = steps.length > 0 && steps.every((step) => step.status === "confirmed");
  const hasFailed = steps.some((step) => step.status === "failed");

  const waitForTransactionReceipt = async (hash: `0x${string}`) => {
    if (!walletClient) {
      throw new Error("Wallet client not available.");
    }

    const startedAt = Date.now();
    const timeoutMs = 180_000;
    while (Date.now() - startedAt < timeoutMs) {
      const receipt = (await walletClient.request({
        method: "eth_getTransactionReceipt",
        params: [hash],
      })) as { status?: string | number } | null;

      if (receipt) {
        const status =
          typeof receipt.status === "string"
            ? Number.parseInt(receipt.status, 16)
            : Number(receipt.status ?? 0);
        if (status !== 1) {
          throw new Error("Transaction reverted.");
        }
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }

    throw new Error("Timed out waiting for transaction confirmation.");
  };

  const executeTransactions = async () => {
    if (!simulateOnly && (!walletClient || !address)) {
      setError("Connect your wallet before executing transactions.");
      return;
    }
    if (steps.length === 0) return;

    setExecuting(true);
    setError(null);

    try {
      const firstPendingIndex = steps.findIndex((step) => step.status !== "confirmed");
      if (firstPendingIndex === -1) {
        setExecuting(false);
        return;
      }

      setSteps((prev) =>
        prev.map((step, index) =>
          index >= firstPendingIndex && step.status === "failed"
            ? { ...step, status: "idle", error: undefined }
            : step
        )
      );

      for (let index = firstPendingIndex; index < steps.length; index += 1) {
        const step = steps[index];
        if (step.status === "confirmed") continue;
        const transaction = step.transaction;
        const stepId = step.id;

        if (simulateOnly) {
          setSteps((prev) =>
            prev.map((existing) =>
              existing.id === stepId
                ? { ...existing, status: "awaiting_wallet", error: undefined }
                : existing
            )
          );
          await new Promise((resolve) => window.setTimeout(resolve, 450));
          const fakeHash = `0xsimulated${Date.now().toString(16)}${index.toString(16)}` as `0x${string}`;
          setSteps((prev) =>
            prev.map((existing) =>
              existing.id === stepId
                ? { ...existing, status: "submitted", hash: fakeHash }
                : existing
            )
          );
          await new Promise((resolve) => window.setTimeout(resolve, 650));
          setSteps((prev) =>
            prev.map((existing) =>
              existing.id === stepId ? { ...existing, status: "confirmed" } : existing
            )
          );
          continue;
        }

        const targetChainId =
          typeof transaction.chainId === "number"
            ? transaction.chainId
            : typeof transaction.chainId === "string"
              ? Number(transaction.chainId)
              : undefined;

        if (targetChainId && chainId !== targetChainId) {
          await switchChainAsync({ chainId: targetChainId });
        }

        setSteps((prev) =>
          prev.map((existing) =>
            existing.id === stepId
              ? { ...existing, status: "awaiting_wallet", error: undefined }
              : existing
          )
        );

        const to =
          typeof transaction.to === "string"
            ? transaction.to
            : typeof transaction.target === "string"
              ? transaction.target
              : undefined;
        if (!to) {
          throw new Error(`Missing target address for ${step.label}.`);
        }

        const hash = (await walletClient.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: address,
              to,
              data:
                typeof transaction.data === "string"
                  ? (transaction.data as `0x${string}`)
                  : undefined,
              value: toRpcQuantity(transaction.value),
              gas: toRpcQuantity(transaction.gas ?? transaction.gasLimit),
              gasPrice: toRpcQuantity(transaction.gasPrice),
              maxFeePerGas: toRpcQuantity(transaction.maxFeePerGas),
              maxPriorityFeePerGas: toRpcQuantity(transaction.maxPriorityFeePerGas),
              nonce: toRpcQuantity(transaction.nonce),
            },
          ],
        })) as `0x${string}`;

        setSteps((prev) =>
          prev.map((existing) =>
            existing.id === stepId ? { ...existing, status: "submitted", hash } : existing
          )
        );

        await waitForTransactionReceipt(hash);

        setSteps((prev) =>
          prev.map((existing) =>
            existing.id === stepId ? { ...existing, status: "confirmed" } : existing
          )
        );
      }
    } catch (executionError) {
      const message =
        executionError instanceof Error
          ? executionError.message
          : "Failed while executing transaction steps.";

      setSteps((prev) => {
        const step = prev.find(
          (candidate) => candidate.status === "awaiting_wallet" || candidate.status === "submitted"
        );
        if (!step) return prev;
        return prev.map((candidate) =>
          candidate.id === step.id ? { ...candidate, status: "failed", error: message } : candidate
        );
      });
      setError(message);
    } finally {
      setExecuting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="max-w-xl mx-auto my-16 rounded-2xl bg-gradient-to-b from-[#0a1020] to-[#080d19] border border-[rgba(136,146,176,0.28)] p-6 shadow-[0_14px_60px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl text-[#f0f4ff] font-semibold">{title}</h3>
            <p className="text-xs text-[#8fa1c8] mt-1">Complete each step in your wallet.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={executing}
            className="text-[#8892b0] hover:text-[#f0f4ff] disabled:opacity-60"
          >
            Close
          </button>
        </div>

        {summary && (
          <div className="mt-4 rounded-xl border border-[rgba(0,229,204,0.28)] bg-[rgba(0,229,204,0.08)] p-4">
            <div className="flex items-center gap-3">
              {summary.tokenImage && (
                <Image
                  src={summary.tokenImage}
                  alt={`${summary.tokenName} logo`}
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 rounded-lg border border-[rgba(136,146,176,0.3)] object-cover bg-[#111827]"
                />
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wide text-[#7cf7ea]">Launch Summary</p>
                <p className="text-base text-[#eff7ff] font-medium mt-1">
                  {summary.tokenName} ({summary.tokenSymbol})
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#b7c8ea]">
              {summary.amountInUsd !== undefined && (
                <span className="rounded-md bg-[#111827] border border-[rgba(136,146,176,0.25)] px-2 py-1">
                  Spend: ${summary.amountInUsd}
                </span>
              )}
              {summary.estimatedTokensOut !== undefined && (
                <span className="rounded-md bg-[#111827] border border-[rgba(136,146,176,0.25)] px-2 py-1">
                  Est. receive: {summary.estimatedTokensOut.toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                  {summary.tokenSymbol}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 space-y-2.5">
          {steps.map((step) => {
            const isDone = step.status === "confirmed";
            const isFailed = step.status === "failed";
            const isActive = step.status === "awaiting_wallet" || step.status === "submitted";
            return (
              <div
                key={step.id}
                className="flex items-start gap-3 rounded-xl border border-[rgba(136,146,176,0.2)] bg-[#111827]/60 p-3.5"
              >
                <span
                  className={[
                    "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                    isDone
                      ? "bg-[#00e5cc] text-[#041217]"
                      : isFailed
                        ? "bg-[#ff6b6b] text-white"
                        : isActive
                          ? "bg-[#f59e0b] text-[#041217]"
                          : "bg-[#374151] text-[#d1d5db]",
                  ].join(" ")}
                >
                  {isDone ? "✓" : isFailed ? "!" : step.status === "submitted" ? "…" : "•"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#f0f4ff] font-medium">{step.label}</p>
                  <p className="text-xs text-[#9aa6c7] mt-1">
                    {step.status === "idle" && "Pending"}
                    {step.status === "awaiting_wallet" && "Confirm in wallet"}
                    {step.status === "submitted" && "Transaction submitted"}
                    {step.status === "confirmed" && "Confirmed"}
                    {step.status === "failed" && (step.error || "Failed")}
                  </p>
                  {step.hash && (
                    <p className="text-[11px] text-[#7cf7ea] mt-1 break-all">Hash: {step.hash}</p>
                  )}
                  {typeof step.transaction.chainSlug === "string" && (
                    <span className="inline-flex items-center gap-1.5 mt-2 rounded-md bg-[#0b1324] border border-[rgba(136,146,176,0.25)] px-2 py-1 text-[11px] text-[#b9c8e8]">
                      {CHAIN_ICONS[step.transaction.chainSlug] && (
                        <Image
                          src={CHAIN_ICONS[step.transaction.chainSlug]}
                          alt={step.transaction.chainSlug}
                          width={14}
                          height={14}
                          className="h-3.5 w-3.5"
                        />
                      )}
                      {step.transaction.chainSlug}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="mt-3 text-sm text-[#ff6b6b]">{error}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-[#9aa6c7] mr-2">
            <input
              type="checkbox"
              checked={simulateOnly}
              onChange={(e) => setSimulateOnly(e.target.checked)}
              disabled={executing}
              className="accent-[#00e5cc]"
            />
            Test mode (no wallet tx)
          </label>
          <button
            type="button"
            onClick={executeTransactions}
            disabled={executing || allConfirmed}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#00e5cc] to-[#14b8a6] text-[#041217] disabled:opacity-60"
          >
            {executing
              ? "Waiting for wallet..."
              : allConfirmed
                ? "Completed"
                : hasFailed
                  ? "Retry"
                  : "Start"}
          </button>
          {allConfirmed && successUrl && (
            <a
              href={successUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg text-sm text-[#f0f4ff] border border-[rgba(136,146,176,0.3)] hover:border-[rgba(240,244,255,0.5)]"
            >
              {successUrlLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
