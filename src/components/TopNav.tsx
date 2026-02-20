import Image from "next/image";
import Link from "next/link";
import WalletConnectButton from "./WalletConnectButton";

export default function TopNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-[rgba(136,146,176,0.15)] bg-[#050810]/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/images/logo.jpeg"
            alt="The Boiling Point"
            width={34}
            height={34}
            className="rounded-lg"
          />
          <span className="text-sm md:text-base font-semibold text-[#f0f4ff]" style={{ fontFamily: "var(--font-display)" }}>
            The Boiling Point
          </span>
        </Link>
        <WalletConnectButton />
      </div>
    </nav>
  );
}
