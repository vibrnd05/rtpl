import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CountUp } from "@/components/CountUp";
import { DaysUntil } from "@/components/DaysUntil";
import { FloodlightTower } from "@/components/FloodlightTower";
import { LEAGUE } from "@/lib/league";

/**
 * The landing page is deliberately short: the hero and its scoreboard,
 * then the call to action. Everything else (schedule, teams, venue,
 * FAQ) has been taken off this page — the header nav still points at
 * #schedule and friends, so those links go nowhere until those sections live
 * somewhere again.
 */

function ScoreCell({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="scoreboard-cell" data-reveal>
      <span className="scoreboard-value tnum">{value}</span>
      <span className="scoreboard-label">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      {/* Hero — a night match: two pylons, and the light they throw */}
      <section id="top" className="rise hero-stage">
        <FloodlightTower tone="warm" className="flood-tower flood-tower--left" />
        <FloodlightTower tone="cool" className="flood-tower flood-tower--right" />

        <div className="shell">
          <div className="grid items-center gap-[clamp(28px,5vw,72px)] pt-[clamp(48px,7vw,104px)] md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              <p className="eyebrow mb-5.5 flex items-center gap-2.5" data-reveal>
                <span className="live-dot" />
                Season {LEAGUE.season} · Round Table India
              </p>

              {/* Sized in vw below the md breakpoint: at a flat 72px the
                  wordmark ran off the side of a phone screen. */}
              <h1
                className="ml-[-0.058em] text-[clamp(40px,10.5vw,72px)] font-extrabold leading-[1.03] tracking-[-0.03em]"
                data-reveal
              >
                <span className="block">Round Table</span>
                <span className="block">
                  <span className="swipe inline-block">Premier League</span>
                </span>
                <span className="block text-accent-600">Season {LEAGUE.season}.</span>
              </h1>

              <p
                className="mt-7.5 max-w-[52ch] text-[16.5px] leading-[1.65] md:text-[17.5px]"
                data-reveal
              >
                Two days of floodlit T10 cricket. Five chapter sides, one
                trophy, and every run raising money for the Round Table India
                schools programme. Squads of fifteen, entries close when the
                fifth team is in.
              </p>

              <div className="mt-8.5 flex flex-wrap gap-3" data-reveal>
                <Link href="/register" className="btn btn-primary btn-shine">
                  Register now <span className="btn__arrow">→</span>
                </Link>
                <a href="#schedule" className="btn btn-ghost">
                  See the schedule <span className="btn__arrow">↓</span>
                </a>
              </div>
            </div>

            {/* The mark sits in its own grid column, lit from behind */}
            <div className="mark-glow">
              <Image
                src="/rtpl-logo.png"
                alt=""
                width={2800}
                height={2000}
                priority
                className="ball-float mx-auto h-auto w-full"
              />
            </div>
          </div>

          {/* Scoreboard — the season's numbers, read off a ground's board */}
          <div
            className="scoreboard mt-[clamp(40px,6vw,72px)]"
            data-reveal-group
          >
            <ScoreCell
              value={<DaysUntil iso={LEAGUE.firstBallISO} />}
              label="Days to first ball"
            />
            <ScoreCell value={<CountUp value="10" />} label="Overs a side" />
            <ScoreCell
              value={<CountUp value={String(LEAGUE.teamCount)} />}
              label="Chapter sides"
            />
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="cta-band">
        <div className="shell py-[clamp(52px,7vw,92px)]">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <span className="chip bg-accent text-white" data-reveal>
                Entries close {LEAGUE.entriesClose}
              </span>

              <h2
                className="ml-[-0.058em] mt-5 text-[clamp(31px,6vw,60px)] font-extrabold leading-[1.05] tracking-tight"
                data-reveal
              >
                <span className="block text-accent-600">Own a team.</span>
                <span className="block">Take the field.</span>
              </h2>

              <p
                className="mt-5 max-w-[50ch] text-[15.5px] leading-[1.6] text-ink/75"
                data-reveal
              >
                Fifteen players, five chapter sides, and two days of floodlit
                cricket at {LEAGUE.venue.name}.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3" data-reveal>
                <Link href="/register" className="btn btn-primary btn-shine">
                  Register now <span className="btn__arrow">→</span>
                </Link>
                <a href={`mailto:${LEAGUE.email}`} className="btn btn-ghost">
                  Ask a question <span className="btn__arrow">→</span>
                </a>
              </div>
            </div>

            {/* A match ball on the bounce, spinning as it goes */}
            <div
              className="hidden justify-self-end pb-7 md:block"
              aria-hidden="true"
            >
              <div className="ball-stage">
                <div className="ball-bounce drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]">
                  <div className="ball-photo h-52.5 w-52.5 lg:h-62.5 lg:w-62.5">
                    <Image
                      src="/duce-ball2.png"
                      alt=""
                      width={2400}
                      height={1600}
                      sizes="550px"
                    />
                  </div>
                </div>
                <span className="ball-shadow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
