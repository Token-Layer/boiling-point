"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        mounted,
        authenticationStatus,
        openAccountModal,
        openConnectModal,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          !!account &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#111827] border border-[rgba(136,146,176,0.2)] text-[#f0f4ff] text-sm font-medium hover:border-[rgba(0,229,204,0.35)] transition-colors"
            >
              Connect Wallet
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#14b8a6] text-[#041217] text-sm font-semibold hover:brightness-110 transition-all"
          >
            {account.displayName}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
