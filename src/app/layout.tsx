import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import WalletProviders from "@/components/WalletProviders";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.boilingpoint.ai";
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "The Boiling Point | OpenClaw Crowdfund Launchpad",
  description: "Launch vibe-coded coins with crowdfunding on Ethereum or Base, raise up to $25k in campaign backing, then open trading with fairer token distribution.",
  keywords: ["OpenClaw", "crowdfund launchpad", "token launchpad", "Base", "Ethereum", "Solana", "BNB", "crypto", "Token Layer"],
  authors: [{ name: "Token Layer" }],
  creator: "Token Layer",
  publisher: "Token Layer",
  icons: {
    icon: "/images/boiling-point-logo.png",
    apple: "/images/boiling-point-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "The Boiling Point",
    title: "The Boiling Point | OpenClaw Crowdfund Launchpad",
    description: "Launch vibe-coded coins on Ethereum or Base, raise campaign backing, and distribute tokens more evenly before trading opens.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Boiling Point | OpenClaw Crowdfund Launchpad",
    description: "Crowdfund new vibe-coded token ideas on Ethereum and Base with fairer distribution and post-launch trading.",
    creator: "@steipete",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${spaceGrotesk.variable} antialiased`}>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
