import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GalleryGrid } from "@/components/GalleryGrid";
import { getGallerySections } from "@/lib/gallery";
import { LEAGUE } from "@/lib/league";

export const metadata: Metadata = {
  title: `Photo gallery - RTPL Season ${LEAGUE.season}`,
  description: `Photos from launch day and both match days of the Round Table Premier League Season ${LEAGUE.season}.`,
};

export default function GalleryPage() {
  const sections = getGallerySections();

  return (
    <>
      <SiteHeader variant="back" />

      <div className="shell">
        <section className="pb-6 pt-[clamp(40px,6vw,76px)]">
          <h1
            className="ml-[-0.058em] text-[clamp(38px,5.6vw,68px)] font-extrabold leading-[1.04] tracking-[-0.03em]"
            data-reveal
          >
            Photo gallery
          </h1>
          <p
            className="mt-4 max-w-[52ch] text-[15.5px] leading-[1.65] text-ink/75"
            data-reveal
          >
            Moments from launch day through both days on the pitch. Tap a
            photo to open it full size.
          </p>
        </section>

        <hr className="rule mb-10" />

        {sections.length > 0 ? (
          <GalleryGrid sections={sections} />
        ) : (
          <p className="pb-16 text-ink/70" data-reveal>
            Photos are on their way — check back soon.
          </p>
        )}
      </div>

      <SiteFooter />
    </>
  );
}
