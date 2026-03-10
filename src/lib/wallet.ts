import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  abstract,
  arbitrum,
  avalanche,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet,
  monad,
  polygon,
  unichain,
  unichainSepolia,
  zksync,
  zksyncSepoliaTestnet,
} from "viem/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

export const walletConfig = getDefaultConfig({
  appName: "The Boiling Point",
  projectId,
  ssr: true,
  chains: [
    mainnet,
    base,
    baseSepolia,
    avalanche,
    arbitrum,
    bsc,
    bscTestnet,
    unichain,
    unichainSepolia,
    abstract,
    polygon,
    zksync,
    zksyncSepoliaTestnet,
    monad,
  ],
});
