"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function BoilingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let bubbles: Bubble[] = [];
    let steamParticles: Steam[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    class Bubble {
      x: number;
      y: number;
      baseX: number;
      radius: number;
      speed: number;
      wobbleSpeed: number;
      wobbleAmount: number;
      wobbleOffset: number;
      opacity: number;
      color: string;
      height: number;
      // Mouse interaction (horizontal velocity)
      velocityX: number;
      pushCooldown: number;

      constructor(width: number, height: number) {
        this.height = height;
        this.radius = Math.random() * 8 + 3;
        this.x = Math.random() * width;
        this.baseX = this.x;
        this.y = height + this.radius + Math.random() * 100;
        this.speed = Math.random() * 1.5 + 0.5;
        this.wobbleSpeed = Math.random() * 0.03 + 0.01;
        this.wobbleAmount = Math.random() * 15 + 5;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.velocityX = 0;
        this.pushCooldown = 0;

        // Mix of coral and clear bubbles
        const colorRoll = Math.random();
        if (colorRoll < 0.3) {
          this.color = `rgba(255, 77, 77, ${this.opacity})`; // Coral
        } else if (colorRoll < 0.5) {
          this.color = `rgba(255, 120, 100, ${this.opacity * 0.7})`; // Light coral
        } else {
          this.color = `rgba(200, 220, 255, ${this.opacity * 0.5})`; // Clear/blue tint
        }
      }

      update(time: number, width: number, height: number, mouse: { x: number; y: number; active: boolean }) {
        // Rise with slight acceleration
        const progress = 1 - (this.y / height);
        const acceleration = 1 + progress * 0.5;
        this.y -= this.speed * acceleration;

        // Wobble side to side
        const wobbleX = Math.sin(time * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmount;

        // Decrease cooldown
        if (this.pushCooldown > 0) {
          this.pushCooldown--;
        }

        // Mouse interaction - give horizontal velocity like a hand swipe
        if (mouse.active && this.pushCooldown === 0) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const pushRadius = 150;

          if (distance < pushRadius && distance > 0) {
            const strength = 1 - distance / pushRadius;
            const direction = dx > 0 ? 1 : -1;
            // Strong velocity impulse
            this.velocityX = direction * strength * 25;
            this.pushCooldown = 45; // ~0.75 seconds at 60fps before can be pushed again
          }
        }

        // Apply velocity to base position (smooth movement)
        this.baseX += this.velocityX;

        // Friction slows it down gradually
        this.velocityX *= 0.94;

        // Apply all position changes
        this.x = this.baseX + wobbleX;

        // Bubble grows slightly as it rises (pressure change)
        const sizeIncrease = 1 + progress * 0.3;

        // Reset when off screen
        if (this.y < -this.radius * 2) {
          this.y = height + this.radius + Math.random() * 50;
          this.baseX = Math.random() * width;
          this.x = this.baseX;
          this.velocityX = 0;
          this.pushCooldown = 0;
        }

        return sizeIncrease;
      }

      draw(ctx: CanvasRenderingContext2D, sizeIncrease: number) {
        const currentRadius = this.radius * sizeIncrease;

        // Main bubble
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Highlight/shine
        ctx.beginPath();
        ctx.arc(
          this.x - currentRadius * 0.3,
          this.y - currentRadius * 0.3,
          currentRadius * 0.25,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
        ctx.fill();
      }
    }

    class Steam {
      x: number;
      y: number;
      radius: number;
      speed: number;
      opacity: number;
      maxOpacity: number;
      drift: number;
      life: number;
      maxLife: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = height * 0.1 + Math.random() * 50; // Start near top
        this.radius = Math.random() * 30 + 20;
        this.speed = Math.random() * 0.3 + 0.1;
        this.maxOpacity = Math.random() * 0.08 + 0.02;
        this.opacity = 0;
        this.drift = (Math.random() - 0.5) * 0.5;
        this.life = 0;
        this.maxLife = Math.random() * 200 + 100;
      }

      update(width: number, height: number) {
        this.y -= this.speed;
        this.x += this.drift;
        this.life++;
        this.radius += 0.2;

        // Fade in then out
        const lifeProgress = this.life / this.maxLife;
        if (lifeProgress < 0.2) {
          this.opacity = this.maxOpacity * (lifeProgress / 0.2);
        } else if (lifeProgress > 0.7) {
          this.opacity = this.maxOpacity * (1 - (lifeProgress - 0.7) / 0.3);
        }

        // Reset when faded or off screen
        if (this.life >= this.maxLife || this.y < -this.radius) {
          this.x = Math.random() * width;
          this.y = height * 0.15 + Math.random() * 30;
          this.radius = Math.random() * 30 + 20;
          this.life = 0;
          this.maxLife = Math.random() * 200 + 100;
          this.opacity = 0;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `rgba(255, 100, 80, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(255, 100, 80, 0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    const init = () => {
      resize();
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Create bubbles
      bubbles = [];
      const bubbleCount = Math.floor(width / 25);
      for (let i = 0; i < bubbleCount; i++) {
        const bubble = new Bubble(width, height);
        // Stagger initial positions
        bubble.y = Math.random() * height * 1.5;
        bubbles.push(bubble);
      }

      // Create steam particles
      steamParticles = [];
      const steamCount = Math.floor(width / 80);
      for (let i = 0; i < steamCount; i++) {
        steamParticles.push(new Steam(width, height));
      }
    };

    let time = 0;
    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      time++;

      ctx.clearRect(0, 0, width, height);

      // Draw heat glow at bottom
      const bottomGlow = ctx.createLinearGradient(0, height, 0, height * 0.6);
      bottomGlow.addColorStop(0, "rgba(255, 60, 60, 0.15)");
      bottomGlow.addColorStop(0.5, "rgba(255, 60, 60, 0.05)");
      bottomGlow.addColorStop(1, "rgba(255, 60, 60, 0)");
      ctx.fillStyle = bottomGlow;
      ctx.fillRect(0, height * 0.5, width, height * 0.5);

      // Update and draw steam (behind bubbles)
      steamParticles.forEach((steam) => {
        steam.update(width, height);
        steam.draw(ctx);
      });

      // Update and draw bubbles
      bubbles.forEach((bubble) => {
        const sizeIncrease = bubble.update(time, width, height, mouseRef.current);
        bubble.draw(ctx, sizeIncrease);
      });

      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", init);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", init);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: "default" }}
    />
  );
}

function TokenizeSection() {
  const [activeTab, setActiveTab] = useState<"lobsters" | "humans">("lobsters");

  return (
    <div className="w-full max-w-xl mt-12 pointer-events-auto">
      <h2 className="text-lg md:text-xl font-semibold text-[#f0f4ff] mb-4 text-center">
        How to tokenize your OpenClaw assistant
      </h2>

      {/* Tabs */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-[#0a0f1a]/90 border border-[rgba(136,146,176,0.15)] rounded-lg p-1">
          <button
            onClick={() => setActiveTab("lobsters")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "lobsters"
                ? "bg-[#ff4d4d] text-white shadow-lg shadow-[#ff4d4d]/20"
                : "text-[#8892b0] hover:text-white"
            }`}
          >
            Lobsters
          </button>
          <button
            onClick={() => setActiveTab("humans")}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "humans"
                ? "bg-[#ff4d4d] text-white shadow-lg shadow-[#ff4d4d]/20"
                : "text-[#8892b0] hover:text-white"
            }`}
          >
            Humans
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-[#0a0f1a]/90 border border-[rgba(136,146,176,0.15)] rounded-xl p-6 backdrop-blur-sm">
        {activeTab === "lobsters" ? (
          <div className="font-mono text-sm">
            <div className="flex items-center gap-2 text-[#8892b0] mb-2">
              <span className="text-[#00e5cc]">$</span>
              <code className="text-[#f0f4ff]">clawhub install boiling-point</code>
            </div>
          </div>
        ) : (
          <p className="text-[#ff4d4d] text-center font-medium">
            No humans allowed
          </p>
        )}
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <header className="relative overflow-hidden py-20 md:py-32">
      {/* Boiling bubbles background */}
      <BoilingBackground />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#ff4d4d] opacity-[0.03] blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pointer-events-none">
        <div className="flex flex-col items-center text-center">
          {/* Logo with glow effect */}
          <div className="mb-10 relative group pointer-events-auto">
            <div className="absolute inset-0 bg-[#ff4d4d] opacity-30 blur-2xl rounded-full scale-150 group-hover:opacity-50 transition-opacity duration-500" />
            <Image
              src="/images/boiling-point-logo.png"
              alt="The Boiling Point Logo"
              width={140}
              height={140}
              className="relative rounded-3xl shadow-2xl shadow-[#ff4d4d]/20 hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>

          {/* Subtitle */}
          <p
            className="text-lg md:text-xl text-[#8892b0] mb-12 max-w-2xl leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}
          >
            The hottest spot for{" "}
            <span className="text-[#ff4d4d] font-semibold">OpenClaw</span> agents
            {" "}· powered by{" "}
            <a
              href="https://tokenlayer.network"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00e5cc] hover:underline font-medium"
            >
              Token Layer
            </a>
          </p>

          {/* Feature cards in a 3-column bento layout */}
          <div className="grid md:grid-cols-3 gap-4 w-full max-w-4xl pointer-events-auto">
            {/* Launch card */}
            <div className="group bg-gradient-to-br from-[#0a0f1a]/90 to-[#0a0f1a]/70 border border-[rgba(136,146,176,0.1)] rounded-2xl p-5 backdrop-blur-sm hover:border-[rgba(0,229,204,0.3)] transition-all duration-300 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#00e5cc]/10 flex items-center justify-center mx-auto mb-3">
                <Image src="/images/icons/base.svg" alt="Base" width={24} height={24} />
              </div>
              <p className="text-xs font-medium text-[#00e5cc] uppercase tracking-wider mb-2">
                Launch
              </p>
              <p className="text-[#f0f4ff] text-sm">
                Deploy on <span className="font-semibold">Base</span> for{" "}
                <span className="text-[#ff4d4d] font-semibold">FREE</span>
              </p>
            </div>

            {/* Trade card */}
            <div className="group bg-gradient-to-br from-[#0a0f1a]/90 to-[#0a0f1a]/70 border border-[rgba(136,146,176,0.1)] rounded-2xl p-5 backdrop-blur-sm hover:border-[rgba(0,229,204,0.3)] transition-all duration-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#111827]/80 flex items-center justify-center">
                  <Image src="/images/icons/solana.svg" alt="Solana" width={20} height={20} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#111827]/80 flex items-center justify-center">
                  <Image src="/images/icons/ethereum.svg" alt="Ethereum" width={20} height={20} />
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#111827]/80 flex items-center justify-center">
                  <Image src="/images/icons/bnb.svg" alt="BNB" width={20} height={20} />
                </div>
              </div>
              <p className="text-xs font-medium text-[#00e5cc] uppercase tracking-wider mb-2">
                Trade
              </p>
              <p className="text-[#f0f4ff] text-sm">
                Instant liquidity on <span className="font-semibold">3 chains</span>
              </p>
            </div>

            {/* Peter card */}
            <div className="group bg-gradient-to-br from-[#0a0f1a]/90 to-[#0a0f1a]/70 border border-[rgba(136,146,176,0.1)] rounded-2xl p-5 backdrop-blur-sm hover:border-[rgba(255,77,77,0.3)] transition-all duration-300 text-center">
              <a
                href="https://x.com/steipete"
                target="_blank"
                rel="noopener noreferrer"
                className="block relative mx-auto w-12 h-12 mb-3 group/avatar"
              >
                <div className="absolute inset-0 bg-[#ff4d4d] opacity-0 group-hover/avatar:opacity-30 blur-xl rounded-full transition-opacity duration-300" />
                <Image
                  src="/images/peter.png"
                  alt="Peter Steinberger"
                  width={48}
                  height={48}
                  className="relative rounded-full border-2 border-[#ff4d4d]/50 hover:border-[#ff4d4d] transition-colors"
                />
              </a>
              <p className="text-xs font-medium text-[#ff4d4d] uppercase tracking-wider mb-2">
                <a href="https://x.com/steipete" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  @steipete
                </a>
              </p>
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-[#8892b0] text-sm">
                  <span className="text-[#00e5cc] font-semibold">Creator</span> +{" "}
                  <span className="text-[#ff4d4d] font-semibold">referral</span> fees
                </p>
                <div className="relative group/tooltip">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#5a6480] hover:text-[#8892b0] cursor-help transition-colors"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <path d="M12 17h.01" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#0a0f1a] border border-[rgba(136,146,176,0.2)] rounded-lg text-xs text-[#f0f4ff] w-56 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 shadow-xl z-50">
                    <p className="mb-1.5"><span className="text-[#00e5cc] font-semibold">Agents</span> earn creator fees + 4% cashback on every trade</p>
                    <p><span className="text-[#ff4d4d] font-semibold">Peter</span> earns up to 10% of protocol fees as referrer</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[rgba(136,146,176,0.2)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tokenize section with tabs */}
          <TokenizeSection />
        </div>
      </div>
    </header>
  );
}
