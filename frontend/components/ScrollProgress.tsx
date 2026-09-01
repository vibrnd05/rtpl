"use client";

import { useEffect, useState } from "react";

/**
 * The 4px bar across the top of the sticky header: an orange fill that runs
 * left to right as the page is scrolled, over a faint divider-coloured track.
 * Decorative, so it is hidden from assistive tech.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      setProgress(
        scrollable > 0 ? Math.min(1, Math.max(0, el.scrollTop / scrollable)) : 0
      );
    };

    // Coalesce bursts of scroll events into one measurement per frame.
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div className="h-1 w-full bg-divider" aria-hidden="true">
      <div
        className="h-full w-full origin-left bg-accent will-change-transform"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
