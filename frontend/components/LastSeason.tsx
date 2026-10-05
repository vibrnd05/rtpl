import Image from "next/image";
import type { Team } from "@/lib/teams";
import { TrophyIcon } from "@/components/TrophyIcon";

/**
 * The five chapter sides from last season, staged like a presentation rather
 * than a roster: a spotlit medallion for the champions, then the full set as
 * a line of smaller medals. Trophy gold stands in for this season's orange
 * here on purpose — these results already happened.
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
    <section className="last-season" data-reveal-group>
      <div className="shell">
        <hr className="rule" />
      </div>

      <div className="shell py-[clamp(48px,6vw,88px)]">
        <p className="eyebrow eyebrow--gold flex items-center gap-2.5" data-reveal>
          <span className="recap-dot" />
          Season {season} · final table
        </p>

        <h2
          className="ml-[-0.04em] mt-2.5 max-w-[28ch] text-[clamp(28px,4.6vw,46px)] font-extrabold leading-[1.08] tracking-tight"
          data-reveal
        >
          Five chapters took the field.{" "}
          <span className="swipe swipe--gold inline-block">One</span> took
          the trophy.
        </h2>

        {champion && (
          <div className="champion-banner mt-9" data-reveal>
            <div className="champion-medal">
              <div className="champion-medal__inner">
                <Image
                  src={champion.logo}
                  alt={`${champion.name} logo`}
                  fill
                  sizes="150px"
                  className="object-contain"
                />
              </div>
              <span className="champion-medal__trophy">
                <TrophyIcon className="h-4.5 w-4.5" />
              </span>
            </div>
            <div>
              <span className="chip champion-banner__chip">
                <TrophyIcon className="h-3 w-3" />
                Season {season} champions
              </span>
              <h3 className="mt-2.5 text-[clamp(22px,3vw,30px)] font-extrabold leading-tight">
                {champion.name}
              </h3>
              <p className="mt-2 max-w-[48ch] text-[15px] leading-[1.6] text-ink/75">
                {champion.name} went the distance and lifted the Season{" "}
                {season} trophy. The other four chapters have had a year to
                stew on it — who fancies their chances of taking it back?
              </p>
            </div>
          </div>
        )}

        <div className="teams-grid mt-8" data-reveal>
          {ordered.map((team) => (
            <div
              key={team.slug}
              className={`team-card${team.isChampion ? " team-card--champion" : ""}`}
            >
              {team.isChampion && (
                <span className="team-card__badge">
                  <TrophyIcon className="h-2.5 w-2.5" />
                  Champions
                </span>
              )}
              <div className="team-card__medal">
                <div className="team-card__medal-inner">
                  <Image
                    src={team.logo}
                    alt={`${team.name} logo`}
                    fill
                    sizes="(min-width: 1024px) 110px, (min-width: 640px) 90px, 72px"
                    className="object-contain"
                  />
                </div>
              </div>
              <p className="team-card__name">{team.name}</p>
              <p className="team-card__tag">
                {team.isChampion ? "Defending champions" : "Chapter side"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
