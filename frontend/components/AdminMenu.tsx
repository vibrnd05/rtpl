"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/** Three rules, the width of the button they sit in. */
function MenuIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="2" y1="4" x2="14" y2="4" />
        <line x1="2" y1="8" x2="14" y2="8" />
        <line x1="2" y1="12" x2="14" y2="12" />
      </g>
    </svg>
  );
}

/**
 * The admin link on a phone, where it sits at the far right of the bar — past
 * the register CTA, which is the bar's one job here and keeps both its orange
 * and its place in the reading order.
 *
 * <details> carries the open state, so the menu still works if the JavaScript
 * below never runs; all that handler adds is dismissal — a tap outside or the
 * Escape key. The panel hangs off the trigger's right edge, so being hard
 * against the screen edge opens it inwards.
 */
export function AdminMenu() {
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (event: Event) => {
      const el = menu.current;
      if (el?.open && !el.contains(event.target as Node)) el.open = false;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menu.current) menu.current.open = false;
    };

    // pointerdown rather than click: the menu should go as the tap lands,
    // not after the finger lifts somewhere else.
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <details ref={menu} className="nav-menu md:hidden">
      <summary className="btn btn-secondary" aria-label="More links">
        <MenuIcon />
      </summary>
      <div className="nav-menu__panel">
        <Link href="/admin/login" className="nav-menu__item">
          Admin login
        </Link>
      </div>
    </details>
  );
}
