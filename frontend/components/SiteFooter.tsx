import Link from "next/link";
import { Tricolor } from "./Tricolor";
import { BallMark } from "./CricketBall";
import { LEAGUE } from "@/lib/league";

/**
 * Back on the page ground. With the landing page down to a hero and the
 * orange call to action, the band above this is the page's one loud surface —
 * a light foot lets it be the last thing you look at, and the tricolour closes
 * the page the way the header opens it.
 */
export function SiteFooter() {
  return (
    <footer className="bg-paper text-ink" id="contact">
      <div className="shell pb-8 pt-[clamp(40px,5vw,64px)]">
        <div
          className="grid gap-8 text-sm leading-[1.65] grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
          data-reveal-group
        >
          <div data-reveal>
            <p className="mb-2.5 flex items-baseline gap-0.75 text-[17px] font-extrabold">
              RTPL Season {LEAGUE.season}
              <BallMark className="mb-0.75 h-2.25 w-2.25 self-end" />
            </p>
            <p className="m-0 text-ink/70">
              Round Table India
              <br />
              {LEAGUE.dates}
            </p>
            <p className="m-0 mt-4 text-ink/70">
              {LEAGUE.venue.name}
              <br />
              Guwahati, Assam
            </p>
          </div>

          <div data-reveal>
            <p className="mb-2.5 text-[12.5px] uppercase tracking-[0.08em] text-ink/70">
              Tournament desk
            </p>
            <p className="m-0">
              <a
                href={`mailto:${LEAGUE.email}`}
                className="font-semibold text-accent-700 underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent-600"
              >
                {LEAGUE.email}
              </a>
              <br />
              <span className="tnum text-ink/70">{LEAGUE.phone}</span>
            </p>
          </div>

          <div data-reveal>
            <p className="mb-2.5 text-[12.5px] uppercase tracking-[0.08em] text-ink/70">
              Entries
            </p>
            <p className="m-0">
              <Link
                href="/register"
                className="font-semibold text-accent-700 underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent-600"
              >
                Owner registration form
              </Link>
              <br />
              <span className="text-ink/70">Closes {LEAGUE.entriesClose}</span>
            </p>
          </div>
        </div>

        {/* No section links here any more — the page they pointed at is gone. */}
        <p className="mt-10 mb-0 border-t-2 border-divider pt-6 text-[12.5px] text-ink/60">
          © {new Date(LEAGUE.firstBallISO).getFullYear()} Round Table India.
        </p>
      </div>

      <Tricolor middle="divider" />
    </footer>
  );
}
