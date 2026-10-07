import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { PlayerRegistrationForm } from "./PlayerRegistrationForm";
import { LEAGUE } from "@/lib/league";

export const metadata: Metadata = {
  title: `Player registration - RTPL Season ${LEAGUE.season}`,
  description: `Register as a player for the Round Table Premier League Season ${LEAGUE.season}.`,
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader variant="back" />

      <div className="shell-narrow">
        <section className="pb-10 pt-[clamp(40px,6vw,76px)]">
          <h1
            className="ml-[-0.058em] text-[clamp(38px,5.6vw,68px)] font-extrabold leading-[1.04] tracking-[-0.03em]"
            data-reveal
          >
            Player registration
          </h1>
          <p
            className="mt-4 max-w-[52ch] text-[15.5px] leading-[1.65] text-ink/75"
            data-reveal
          >
            Sign up to play Season {LEAGUE.season}. Teams are decided at the
            auction, not at registration.
          </p>
        </section>

        <hr className="rule" />

        <PlayerRegistrationForm />
      </div>

      <div className="shell-narrow">
        <footer className="border-t-2 border-divider py-10 text-[13.5px] leading-[1.65] text-ink/70">
          Questions about an entry:{" "}
          <a
            href={`mailto:${LEAGUE.email}`}
            className="text-accent-700 hover:text-accent-600"
          >
            {LEAGUE.email}
          </a>{" "}
          · {LEAGUE.phone}
        </footer>
      </div>
    </>
  );
}
