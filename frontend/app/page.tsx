import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CountUp } from "@/components/CountUp";
import { DaysUntil } from "@/components/DaysUntil";
import { FloodlightTower } from "@/components/FloodlightTower";
import { LastSeason } from "@/components/LastSeason";
import { GlimpsesStrip } from "@/components/GlimpsesStrip";
import { getLastSeasonTeams } from "@/lib/teams";
import { LEAGUE } from "@/lib/league";

/**
 * The landing page is deliberately short: the hero and its ticker, then the
 * call to action. Everything else (schedule, teams, venue, FAQ) has been
 * taken off this page — the header nav still points at #schedule and
 * friends, so those links go nowhere until those sections live somewhere
 * again.
 */

function TickerItem({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="ticker__item" data-reveal>
      <span className="ticker__value tnum">{value}</span>
      <span className="ticker__label">{label}</span>
    </div>
  );
}

export default function Home() {
  const lastSeasonTeams = getLastSeasonTeams();

  return (
    <>
      <SiteHeader />

      {/* Hero — a cinematic backdrop rather than a two-column layout: the
          wicket photograph sits large behind the copy as one scene, under
          two off-frame floodlight towers. */}
      <section id="top" className="rise hero">
        <FloodlightTower tone="warm" className="flood-tower flood-tower--left" />
        <FloodlightTower tone="cool" className="flood-tower flood-tower--right" />

        <div className="hero__inner shell">
          <div className="hero__content">
            {/* Sized in vw below the md breakpoint: at a flat 72px the
                wordmark ran off the side of a phone screen. */}
            <h1
              className="ml-[-0.058em] text-[clamp(40px,9vw,80px)] font-extrabold leading-[1.02] tracking-[-0.03em]"
              data-reveal
            >
              <span className="block">Round Table</span>
              <span className="block">
                <span className="swipe inline-block">Premier League</span>
              </span>
              <span className="block text-accent-600">Season {LEAGUE.season}.</span>
            </h1>

            <p
              className="mt-7.5 max-w-[56ch] text-[16.5px] leading-[1.65] md:text-[17.5px]"
              data-reveal
            >
              Two days of floodlit T10 cricket. Five chapter sides, one
              trophy, and every run raising money for the Round Table India
              schools programme. Squads of fourteen, entries close when the
              fifth team is in.
            </p>

            <div className="mt-8.5 flex flex-wrap gap-3" data-reveal>
              <Link href="/register" className="btn btn-primary btn-shine">
                Register now <span className="btn__arrow">→</span>
              </Link>
              <a href="#schedule" className="btn btn-ghost">
                See the schedule
              </a>
            </div>
          </div>
        </div>

        {/* The shattered wicket, large behind the copy rather than confined
            to a side column — a scrim fades it toward the text. */}
        <div className="hero__backdrop" aria-hidden="true">
          <Image
            src="/wicket-hero.png"
            alt=""
            width={2336}
            height={1744}
            priority
            className="hero__backdrop-img ball-float"
          />
        </div>
        <div className="hero__scrim" aria-hidden="true" />
      </section>

      {/* Ticker — a full-bleed stat rail, not a boxed scoreboard card */}
      <div className="ticker" data-reveal-group>
        <TickerItem
          value={<DaysUntil iso={LEAGUE.firstBallISO} />}
          label="Days to first ball"
        />
        <TickerItem value={<CountUp value="10" />} label="Overs a side" />
        <TickerItem
          value={<CountUp value={String(LEAGUE.teamCount)} />}
          label="Chapter sides"
        />
      </div>

      {lastSeasonTeams.length > 0 && (
        <LastSeason teams={lastSeasonTeams} season={LEAGUE.season - 1} />
      )}

      <GlimpsesStrip />

      {/* Closing call to action — its own panel, ruled off top and bottom */}
      <section className="cta-band">
        <div className="cta-band__inner shell">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h2
                className="ml-[-0.058em] text-[clamp(31px,6vw,60px)] font-extrabold leading-[1.05] tracking-tight"
                data-reveal
              >
                <span className="block text-accent-600">Pick up a bat.</span>
                <span className="block">Take the field.</span>
              </h2>

              <p
                className="mt-5 max-w-[50ch] text-[15.5px] leading-[1.6] text-ink/75"
                data-reveal
              >
                Fourteen players, five chapter sides, and two days of floodlit
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
