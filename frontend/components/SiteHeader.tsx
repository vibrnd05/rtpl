import Link from "next/link";
import Image from "next/image";
import { ScrollProgress } from "./ScrollProgress";
import { AdminMenu } from "./AdminMenu";

/**
 * The wordmark is artwork rather than type. Its letterforms are near-black,
 * which would disappear on the navy ground were it not for the white keyline
 * cut around them — that outline is what makes it read, so do not strip it or
 * recolour the file. Sized by height with the width left to follow, since the
 * source is 1237x214 and only its height matters against the 68px bar.
 *
 * 28px on a phone rather than 32px: the source is 5.8 times wider than it is
 * tall, so every pixel of height costs six of width on the row where width is
 * the scarce thing. `object-contain` under a max-width is the backstop — below
 * about 340px the mark scales down instead of pushing the buttons off the bar.
 */
function Wordmark() {
  return (
    <Link href="/" className="mr-auto flex min-w-0 items-center">
      <Image
        src="/rtpl-text-white.png"
        alt="RTPL"
        width={1237}
        height={214}
        priority
        sizes="162px"
        className="h-7 w-auto max-w-full object-contain object-left md:h-10"
      />
    </Link>
  );
}

/**
 * `league` — wordmark, the admin login link and the register CTA (landing page).
 * `back`   — wordmark plus a single return link (registration page).
 *
 * There is no section nav: the links it held (League, Schedule, Teams, Venue,
 * FAQ) pointed at sections that are not on the page, so the bar now carries
 * only the actions that go somewhere.
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
      <div className={`${shell} flex h-17 items-center gap-3 md:gap-7`}>
        <Wordmark />

        {variant === "league" ? (
          <div className="flex shrink-0 items-center gap-2 md:gap-2.5">
            {/* From md up the admin link is a button of its own, ahead of the
                CTA. Below that it is the menu at the end of the bar instead. */}
            <Link
              href="/gallery"
              className="btn btn-secondary hidden md:inline-flex"
            >
              Gallery
            </Link>
            <Link
              href="/admin/login"
              className="btn btn-secondary hidden md:inline-flex"
            >
              Admin login
            </Link>
            <Link href="/register" className="btn btn-primary">
              {/* The bar is 120px narrower than the label needs on a phone. */}
              <span className="md:hidden">Register</span>
              <span className="hidden md:inline">Register now</span>
            </Link>
            <AdminMenu />
          </div>
        ) : (
          <Link
            href="/"
            className="shrink-0 text-[13px] uppercase tracking-[0.08em] text-ink transition-colors hover:text-accent-700"
          >
            <span className="md:hidden">← Back</span>
            <span className="hidden md:inline">← Back to the league</span>
          </Link>
        )}
      </div>
    </header>
  );
}
