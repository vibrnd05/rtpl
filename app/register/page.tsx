import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Tricolor } from "@/components/Tricolor";
import { RegistrationForm } from "./RegistrationForm";
import { LEAGUE } from "@/lib/league";

export const metadata: Metadata = {
  title: `Owner registration — RTPL Season ${LEAGUE.season}`,
  description: `Enter your chapter into the Round Table Premier League. Entries close ${LEAGUE.entriesClose}.`,
};

export default function RegisterPage() {
  return (
    <>
      <SiteHeader variant="back" />

      <div className="shell-narrow">
        <section className="pb-10 pt-[clamp(40px,6vw,76px)]">
          <p className="eyebrow mb-[22px] flex items-center gap-2.5" data-reveal>
            <span className="inline-block h-2.5 w-2.5 bg-accent" />
            Entries close {LEAGUE.entriesClose} · {LEAGUE.slotsOpen} slots open
          </p>
          <h1
            className="-ml-[0.058em] text-[clamp(38px,5.6vw,68px)] font-extrabold leading-[1.04] tracking-[-0.03em]"
            data-reveal
          >
            Owner registration
          </h1>
          <p className="mt-[26px] max-w-[56ch] text-[17px] leading-[1.65]" data-reveal>
            One form per side, submitted by the owners. Six questions, about two
            minutes. The tournament desk reviews every entry and comes back to
            you on the number you give with the owner agreement and the auction
            brief.
          </p>
        </section>

        <hr className="rule" />

        <RegistrationForm />
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
        <div className="mb-7">
          <Tricolor middle="divider" />
        </div>
      </div>
    </>
  );
}
