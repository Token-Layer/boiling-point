import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "The Boiling Point - OpenClaw Crowdfund Launchpad";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";


// Base64 encoded SVG icons
const baseIcon = `data:image/svg+xml,${encodeURIComponent(`<svg viewBox="0 0 1280 1280" xmlns="http://www.w3.org/2000/svg"><path fill="#0052FF" d="M0,101.12c0-34.64,0-51.95,6.53-65.28,6.25-12.76,16.56-23.07,29.32-29.32C49.17,0,66.48,0,101.12,0h1077.76c34.63,0,51.96,0,65.28,6.53,12.75,6.25,23.06,16.56,29.32,29.32,6.52,13.32,6.52,30.64,6.52,65.28v1077.76c0,34.63,0,51.96-6.52,65.28-6.26,12.75-16.57,23.06-29.32,29.32-13.32,6.52-30.65,6.52-65.28,6.52H101.12c-34.64,0-51.95,0-65.28-6.52-12.76-6.26-23.07-16.57-29.32-29.32-6.53-13.32-6.53-30.65-6.53-65.28V101.12Z"/></svg>`)}`;

const solanaIcon = `data:image/svg+xml,${encodeURIComponent(`<svg width="101" height="88" viewBox="0 0 101 88" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100.48 69.3817L83.8068 86.8015C83.4444 87.1799 83.0058 87.4816 82.5185 87.6878C82.0312 87.894 81.5055 88.0003 80.9743 88H1.93563C1.55849 88 1.18957 87.8926 0.874202 87.6912C0.558829 87.4897 0.31074 87.2029 0.160416 86.8659C0.0100923 86.529 -0.0359181 86.1566 0.0280382 85.7945C0.0919944 85.4324 0.263131 85.0964 0.520422 84.8278L17.2061 67.408C17.5676 67.0306 18.0047 66.7295 18.4904 66.5234C18.9762 66.3172 19.5002 66.2104 20.0301 66.2095H99.0644C99.4415 66.2095 99.8104 66.3169 100.126 66.5183C100.441 66.7198 100.689 67.0067 100.84 67.3436C100.99 67.6806 101.036 68.0529 100.972 68.415C100.908 68.7771 100.737 69.1131 100.48 69.3817ZM83.8068 34.3032C83.4444 33.9248 83.0058 33.6231 82.5185 33.4169C82.0312 33.2108 81.5055 33.1045 80.9743 33.1048H1.93563C1.55849 33.1048 1.18957 33.2121 0.874202 33.4136C0.558829 33.6151 0.31074 33.9019 0.160416 34.2388C0.0100923 34.5758 -0.0359181 34.9482 0.0280382 35.3103C0.0919944 35.6723 0.263131 36.0083 0.520422 36.277L17.2061 53.6968C17.5676 54.0742 18.0047 54.3752 18.4904 54.5814C18.9762 54.7875 19.5002 54.8944 20.0301 54.8952H99.0644C99.4415 54.8952 99.8104 54.7879 100.126 54.5864C100.441 54.3849 100.689 54.0981 100.84 53.7612C100.99 53.4242 101.036 53.0518 100.972 52.6897C100.908 52.3277 100.737 51.9917 100.48 51.723L83.8068 34.3032ZM1.93563 21.7905H80.9743C81.5055 21.7907 82.0312 21.6845 82.5185 21.4783C83.0058 21.2721 83.4444 20.9704 83.8068 20.592L100.48 3.17219C100.737 2.90357 100.908 2.56758 100.972 2.2055C101.036 1.84342 100.99 1.47103 100.84 1.13408C100.689 0.79713 100.441 0.510296 100.126 0.308823C99.8104 0.107349 99.4415 0 99.0644 0L20.0301 0C19.5002 0.000878 18.9762 0.1077 18.4904 0.313848C18.0047 0.52 17.5676 0.821087 17.2061 1.19848L0.524723 18.6183C0.267681 18.8866 0.0966198 19.2223 0.0325185 19.5839C-0.0315829 19.9456 0.0140624 20.3177 0.163856 20.6545C0.31365 20.9913 0.561081 21.2781 0.875804 21.4799C1.19053 21.6817 1.55886 21.7896 1.93563 21.7905Z" fill="url(#paint0_linear)"/><defs><linearGradient id="paint0_linear" x1="8.52558" y1="90.0973" x2="88.9933" y2="-3.01622" gradientUnits="userSpaceOnUse"><stop offset="0.08" stop-color="#9945FF"/><stop offset="0.3" stop-color="#8752F3"/><stop offset="0.5" stop-color="#5497D5"/><stop offset="0.6" stop-color="#43B4CA"/><stop offset="0.72" stop-color="#28E0B9"/><stop offset="0.97" stop-color="#19FB9B"/></linearGradient></defs></svg>`)}`;

const ethereumIcon = `data:image/svg+xml,${encodeURIComponent(`<svg viewBox="0 0 784 1280" xmlns="http://www.w3.org/2000/svg"><path fill="#627EEA" d="m392.07 0-8.57 29.11v844.63l8.57 8.55 392.06-231.75z"/><path fill="#627EEA" d="M392.07 0 0 650.54l392.07 231.75V472.33z"/><path fill="#627EEA" d="M392.07 956.52 387.24 962.41v301.23l4.83 14.1 392.3-552.35z"/><path fill="#627EEA" d="M392.07 1277.74V956.52L0 725.39z"/><path fill="#8EA9FF" d="m392.07 882.29 392.06-231.75-392.06-178.21z"/><path fill="#C3D1FF" d="m0 650.54 392.07 231.75V472.33z"/></svg>`)}`;

const bnbIcon = `data:image/svg+xml,${encodeURIComponent(`<svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.8814 14.7044L48.1429 0L73.4043 14.7044L64.117 20.1366L48.1429 10.8644L32.1687 20.1366L22.8814 14.7044ZM73.4043 33.2488L64.117 27.8166L48.1429 37.0888L32.1687 27.8166L22.8814 33.2488V44.1132L38.8555 53.3854V71.9297L48.1429 77.362L57.4302 71.9297V53.3854L73.4043 44.1132V33.2488ZM73.4043 62.6576V51.7932L64.117 57.2254V68.0898L73.4043 62.6576ZM79.9984 66.4976L64.0243 75.7698V86.6341L89.2857 71.9297V42.521L79.9984 47.9532V66.4976ZM70.7111 23.9766L79.9984 29.4088V40.2732L89.2857 34.841V23.9766L79.9984 18.5444L70.7111 23.9766ZM38.8555 79.7034V90.5678L48.1429 96L57.4302 90.5678V79.7034L48.1429 85.1356L38.8555 79.7034ZM22.8814 62.6576L32.1687 68.0898V57.2254L22.8814 51.7932V62.6576ZM38.8555 23.9766L48.1429 29.4088L57.4302 23.9766L48.1429 18.5444L38.8555 23.9766ZM16.2873 29.4088L25.5746 23.9766L16.2873 18.5444L7 23.9766V34.841L16.2873 40.2732V29.4088ZM16.2873 47.9532L7 42.521V71.9297L32.2615 86.6341V75.7698L16.2873 66.4976V47.9532Z" fill="#F0B90B"/></svg>`)}`;

export default async function Image() {
  // Load fonts directly using fetch with URL - Next.js bundles these at build time
  const [clashDisplayBold, satoshiMedium] = await Promise.all([
    fetch(new URL("../../public/fonts/ClashDisplay-Bold.woff", import.meta.url)).then((res) => res.arrayBuffer()),
    fetch(new URL("../../public/fonts/Satoshi-Medium.woff", import.meta.url)).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050810 0%, #0a0f1a 50%, #111827 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow effects */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 77, 77, 0.3) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0, 229, 204, 0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "200px",
            left: "600px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 77, 77, 0.15) 0%, transparent 70%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Title with gradient - BOLD */}
          <div
            style={{
              fontSize: "80px",
              fontFamily: "Clash Display",
              fontWeight: 700,
              background: "linear-gradient(135deg, #ff4d4d 0%, #00e5cc 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: "8px",
              letterSpacing: "-3px",
            }}
          >
            The Boiling Point
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "32px",
              fontFamily: "Satoshi",
              display: "flex",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            <span style={{ color: "#ff4d4d", fontWeight: 700 }}>OpenClaw</span>
            <span style={{ color: "#8892b0", fontWeight: 500 }}>Crowdfund Launchpad</span>
          </div>

          {/* Free launches text */}
          <div
            style={{
              fontSize: "22px",
              fontFamily: "Satoshi",
              fontWeight: 500,
              color: "#f0f4ff",
              marginBottom: "24px",
            }}
          >
            Fund on Ethereum or Base • Distribute fairly
          </div>

          {/* Chain icons - Base emphasized */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* Base - larger and highlighted */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px",
                background: "rgba(0, 82, 255, 0.15)",
                borderRadius: "16px",
                border: "2px solid rgba(0, 82, 255, 0.4)",
              }}
            >
              <img
                src={baseIcon}
                width="64"
                height="64"
                style={{ borderRadius: "14px" }}
              />
              <span style={{ fontSize: "14px", color: "#f0f4ff", marginTop: "8px", fontWeight: 600 }}>Base</span>
            </div>

            {/* Arrow */}
            <div style={{ fontSize: "24px", color: "#5a6480" }}>→</div>

            {/* Other chains */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "60px",
                }}
              >
                <div style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={solanaIcon} width="50" height="44" />
                </div>
                <span style={{ fontSize: "12px", color: "#8892b0", marginTop: "8px" }}>Solana</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "60px",
                }}
              >
                <div style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={ethereumIcon} width="28" height="44" />
                </div>
                <span style={{ fontSize: "12px", color: "#8892b0", marginTop: "8px" }}>Ethereum</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "60px",
                }}
              >
                <div style={{ height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={bnbIcon} width="44" height="44" />
                </div>
                <span style={{ fontSize: "12px", color: "#8892b0", marginTop: "8px" }}>BNB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#5a6480",
            fontSize: "16px",
          }}
        >
          <span>Powered by</span>
          <span style={{ color: "#f0f4ff", fontWeight: 600 }}>Token Layer</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Clash Display",
          data: clashDisplayBold,
          weight: 700,
          style: "normal",
        },
        {
          name: "Satoshi",
          data: satoshiMedium,
          weight: 500,
          style: "normal",
        },
      ],
    }
  );
}
