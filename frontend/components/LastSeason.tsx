import Image from "next/image";
import type { Team } from "@/lib/teams";
import { TrophyIcon } from "@/components/TrophyIcon";

/**
 * One table, not a feature card plus a separate list — the champion was
 * showing up twice in the old layout (once in a banner, again as row one),
 * which was half the clutter. Here the champion is just the first row,
 * picked out by a highlighted background and a bigger medal instead of a
 * whole duplicate component. "RTPL {season}.0" is spelled out in both the
 * kicker and the row-one note so it reads as last year's result on sight,
 * not a guess.
 */
export function LastSeason({
  teams,
  season,
}: {
  teams: Team[];
  season: number;
}) {
  const champion = teams.find((team) => team.isChampion);
  const rest = teams.filter((team) => !team.isChampion);
  const ordered = champion ? [champion, ...rest] : teams;

  return (
    <section className="recap" data-reveal-group>
      <div className="shell">
        <div className="recap__head">
          <p className="eyebrow eyebrow--muted flex items-center gap-2.5" data-reveal>
            <span className="recap-dot" />
            Last year · RTPL {season}.0
          </p>
          <h2
            className="ml-[-0.04em] mt-2.5 max-w-[22ch] text-[clamp(28px,4vw,42px)] font-extrabold leading-[1.1] tracking-tight"
            data-reveal
          >
            Here&rsquo;s how RTPL {season}.0 finished.
          </h2>
        </div>

        <ol className="standings mt-10" data-reveal>
          {ordered.map((team, index) => (
            <li
              key={team.slug}
              className={`standings__row${team.isChampion ? " standings__row--champion" : ""}`}
            >
              <span className="standings__pos tnum">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="standings__medal">
                <span className="standings__medal-inner">
                  <Image
                    src={team.logo}
                    alt={`${team.name} logo`}
                    fill
                    sizes="(min-width: 640px) 56px, 44px"
                    className="object-contain"
                  />
                </span>
                {team.isChampion && (
                  <span className="standings__trophy">
                    <TrophyIcon className="h-3.5 w-3.5" />
                  </span>
                )}
              </span>
              <span className="standings__info">
                <span className="standings__name">{team.name}</span>
                {team.isChampion && (
                  <span className="standings__note">
                    Lifted the RTPL {season}.0 trophy
                  </span>
                )}
              </span>
              <span className="standings__tag">
                {team.isChampion ? "Champions" : "Chapter side"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
