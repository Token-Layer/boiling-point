"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  triggerOnParentClass?: string;
}

const GLITCH_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

export default function GlitchText({ text, className, triggerOnParentClass }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  const startGlitch = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let progress = 0;
    const totalFrames = 16;

    intervalRef.current = setInterval(() => {
      progress += 1;
      const revealCount = Math.floor((progress / totalFrames) * text.length);

      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealCount) return text[i];
          return /[a-z0-9]/i.test(char) ? randomChar() : char;
        })
        .join("");

      setDisplayText(next);

      if (progress >= totalFrames) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = null;
        setDisplayText(text);
      }
    }, 28);
  }, [text]);

  useEffect(() => {
    const el = spanRef.current;
    if (!el || !triggerOnParentClass) return;

    const parent = el.closest(`.${triggerOnParentClass}`);
    if (!parent) return;

    const onEnter = () => startGlitch();
    parent.addEventListener("mouseenter", onEnter);
    parent.addEventListener("focusin", onEnter);

    return () => {
      parent.removeEventListener("mouseenter", onEnter);
      parent.removeEventListener("focusin", onEnter);
    };
  }, [startGlitch, triggerOnParentClass]);

  return (
    <span
      ref={spanRef}
      className={className}
      onMouseEnter={startGlitch}
      onFocus={startGlitch}
      tabIndex={0}
      aria-label={text}
    >
      {displayText}
    </span>
  );
}
