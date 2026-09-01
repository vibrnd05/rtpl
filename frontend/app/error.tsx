"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Tricolor } from "@/components/Tricolor";
import { LEAGUE } from "@/lib/league";

/**
 * Without this boundary any throw below the layout — most likely a server
 * action the running deployment no longer recognises, which is what a client
 * on stale JS gets after a redeploy — replaces the whole page with Next's bare
 * "a client-side exception has occurred" text. On the registration form that
 * also silently discards everything the owner typed.
 *
 * `reset()` re-renders the segment against the current build, so the usual
 * remedy is one click rather than an explanation of browser caches.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[rtpl] unhandled error", error);
  }, [error]);

  return (
    <>
      <SiteHeader variant="back" />

      <div className="shell-narrow">
        <section className="pb-10 pt-[clamp(40px,6vw,76px)]">
          <p className="eyebrow mb-[22px] flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 bg-accent" />
            Something went wrong
          </p>
          <h1 className="-ml-[0.058em] max-w-[20ch] text-[clamp(38px,5.6vw,68px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            That did not go through.
          </h1>
          <p className="mt-[26px] max-w-[56ch] text-[17px] leading-[1.65]">
            The page hit an error before it could finish. Trying again usually
            clears it — the site may have been updated while this tab was open.
            If it keeps happening, the desk can take your entry directly.
          </p>

          <div className="mt-[34px] flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="btn btn-primary">
              Try again <span className="btn__arrow">→</span>
            </button>
            <Link href="/register" className="btn btn-ghost">
              Back to registration
            </Link>
          </div>

          <p className="mt-8 text-[13.5px] leading-[1.65] text-ink/70">
            Questions about an entry:{" "}
            <a
              href={`mailto:${LEAGUE.email}`}
              className="text-accent-700 hover:text-accent-600"
            >
              {LEAGUE.email}
            </a>{" "}
            · {LEAGUE.phone}
            {/* Vercel strips the message in production; the digest is the only
                handle that ties this screen to a line in the runtime logs. */}
            {error.digest && (
              <>
                <br />
                <span className="tnum text-ink/45">Reference: {error.digest}</span>
              </>
            )}
          </p>
        </section>
      </div>

      <div className="shell-narrow">
        <div className="mb-7">
          <Tricolor middle="divider" />
        </div>
      </div>
    </>
  );
}
