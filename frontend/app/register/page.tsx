import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { PlayerRegistrationForm } from "./PlayerRegistrationForm";
import { LEAGUE } from "@/lib/league";
import { getPlayerAvailability } from "@/lib/api";

// Checked on every visit, so the form closes the moment the 70th entry lands.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Player registration - RTPL Season ${LEAGUE.season}`,
  description: `Register as a player for the Round Table Premier League Season ${LEAGUE.season}.`,
};

export default async function RegisterPage() {
  // If the API cannot be reached the form stays up; the backend still
  // refuses anything past the cap.
  const availability = await getPlayerAvailability();
  const closed = availability?.open === false;

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

        {closed ? (
          <section className="py-[clamp(56px,8vw,110px)]">
            <p className="eyebrow mb-6 flex items-center gap-3">
              <span className="inline-block h-2.5 w-2.5 bg-accent" />
              Registrations closed
            </p>
            <h2 className="ml-[-0.058em] max-w-[26ch] text-[clamp(30px,4vw,50px)] font-extrabold leading-[1.06] tracking-tight">
              Player registrations are full for this season.
            </h2>
            <p className="mt-7 max-w-[56ch] text-[16.5px] leading-[1.65]">
              All places have been taken. Please do not make a payment.
            </p>
          </section>
        ) : (
          <PlayerRegistrationForm />
        )}
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
