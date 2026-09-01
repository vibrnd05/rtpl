"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reveals anything marked `data-reveal` as it scrolls into view.
 *
 * Mounted once in the layout rather than wrapping every section, so markup
 * stays declarative: add the attribute, get the reveal. Children of a
 * `data-reveal-group` cascade instead of all landing at once.
 *
 * The hidden state lives in CSS behind `html.js` and a reduced-motion guard
 * (see globals.css), so nothing here is load-bearing for content being
 * readable — if this never runs, the page simply shows everything.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const groups = document.querySelectorAll<HTMLElement>("[data-reveal-group]");
    for (const group of Array.from(groups)) {
      Array.from(group.children).forEach((child, i) => {
        if (child instanceof HTMLElement && child.hasAttribute("data-reveal")) {
          // Cap the cascade so long grids do not leave the last card waiting.
          child.style.transitionDelay = `${Math.min(i, 9) * 65}ms`;
        }
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("revealed");
          // Reveal once — scrolling back up should not replay it.
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );

    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
    // Re-scan after a client-side navigation, since the layout persists.
  }, [pathname]);

  return null;
}
