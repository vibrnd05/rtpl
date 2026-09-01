"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Splits a display value into the bits around its number, so "₹9L",
 * "1,200" and "900 m" all animate their numeric part and keep the rest.
 */
function parse(value: string) {
  const match = value.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/s);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const num = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  return { prefix, suffix, num, grouped: digits.includes(",") };
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function CountUp({
  value,
  className,
  duration = 1100,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const parsed = parse(value);
  const ref = useRef<HTMLSpanElement>(null);
  // Server-renders the final value, so the figure is correct without JS and
  // hydration matches. The parent's reveal keeps the reset to 0 out of sight.
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!parsed) return;
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const format = (n: number) => {
      const rounded = Math.round(n);
      return (
        parsed.prefix +
        (parsed.grouped ? rounded.toLocaleString("en-IN") : String(rounded)) +
        parsed.suffix
      );
    };

    setShown(format(0));

    let frame = 0;
    let start = 0;

    const step = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      setShown(format(parsed.num * easeOutExpo(t)));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
