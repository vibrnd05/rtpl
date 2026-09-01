"use client";

import { useEffect, useState } from "react";

/**
 * Whole days from now until an ISO instant, for the scoreboard.
 *
 * Client-only on purpose. This page is prerendered, so a figure worked out on
 * the server would be frozen at the moment of the last deploy and would drift
 * a day further out of date every day. Both the server and the first client
 * render show the placeholder, so there is no hydration mismatch; the real
 * number lands on mount and refreshes hourly for anyone who leaves the tab
 * open over midnight.
 */
export function DaysUntil({
  iso,
  className,
}: {
  iso: string;
  className?: string;
}) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const ms = new Date(iso).getTime() - Date.now();
      setDays(Math.max(0, Math.ceil(ms / 86_400_000)));
    };
    tick();
    const id = setInterval(tick, 3_600_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <span className={className}>
      {days === null ? "—" : days.toLocaleString("en-IN")}
    </span>
  );
}
