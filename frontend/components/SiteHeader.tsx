import Link from "next/link";
import Image from "next/image";
import { ScrollProgress } from "./ScrollProgress";

/**
 * The wordmark is artwork rather than type. Its letterforms are near-black,
 * which would disappear on the navy ground were it not for the white keyline
 * cut around them — that outline is what makes it read, so do not strip it or
 * recolour the file. Sized by height with the width left to follow, since the
 * source is 1237x214 and only its height matters against the 68px bar.
 */
function Wordmark() {
  return (
    <Link href="/" className="mr-auto flex items-center">
      <Image
        src="/rtpl-text-white.png"
        alt="RTPL"
        width={1237}
        height={214}
        priority
        sizes="162px"
        className="h-8 w-auto md:h-10"
      />
    </Link>
  );
}

/**
 * `league` — wordmark and the register CTA (landing page).
 * `back`   — wordmark plus a single return link (registration page).
 *
 * There is no section nav: the links it held (League, Schedule, Teams, Venue,
 * FAQ) pointed at sections that are not on the page, so the bar now carries
 * the one action that goes anywhere.
 */
export function SiteHeader({
  variant = "league",
}: {
  variant?: "league" | "back";
}) {
  const shell = variant === "league" ? "shell" : "shell-narrow";

  return (
    <header className="sticky top-0 z-20 border-b-2 border-divider bg-paper">
      <ScrollProgress />
      <div className={`${shell} flex h-17 items-center gap-6 md:gap-7`}>
        <Wordmark />

        {variant === "league" ? (
          <Link href="/register" className="btn btn-primary">
            Register now
          </Link>
        ) : (
          <Link
            href="/"
            className="text-[13px] uppercase tracking-[0.08em] text-ink transition-colors hover:text-accent-700"
          >
            ← Back to the league
          </Link>
        )}
      </div>
    </header>
  );
}
