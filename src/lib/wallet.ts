import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

export const walletConfig = getDefaultConfig({
  appName: "The Boiling Point",
  projectId,
  ssr: true,
  chains: [mainnet],
});
