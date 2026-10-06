import Link from "next/link";
import Image from "next/image";

type Polaroid = {
  src: string;
  alt: string;
  caption: string;
  rotate: "left" | "right";
};

/** A handful of prints from last season, not the full set — that lives at /gallery. */
const PHOTOS: Polaroid[] = [
  {
    src: "/gallery/launch/TRK07888.JPG",
    alt: "The RTPL 7.0 trophy revealed on launch night",
    caption: "Launch night",
    rotate: "left",
  },
  {
    src: "/gallery/day-1/TRK08154.JPG",
    alt: "A batter mid-shot on Day 1",
    caption: "Day 1, mid-over",
    rotate: "right",
  },
  {
    src: "/gallery/day-1/TRK08216.JPG",
    alt: "A player walking out to bat",
    caption: "Game face on",
    rotate: "left",
  },
  {
    src: "/gallery/day-2/TRK09506.JPG",
    alt: "A chapter side walking off the field together",
    caption: "The squad",
    rotate: "right",
  },
  {
    src: "/gallery/launch/TRK07630.JPG",
    alt: "Two chapter members at the launch party",
    caption: "Launch party",
    rotate: "left",
  },
];

/**
 * A scrapbook strip of prints from Season 7, dropped between the final table
 * and the CTA — this season's result is already written above it, so this is
 * what it looked like getting there. The full set lives at /gallery; this is
 * a taste of it, not a second copy.
 */
export function GlimpsesStrip() {
  return (
    <section className="glimpses" data-reveal-group>
      <div className="shell">
        <hr className="rule" />
      </div>

      <div className="shell py-[clamp(44px,6vw,80px)]">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow flex items-center gap-2.5" data-reveal>
              <span className="live-dot" />
              Glimpses from RTPL 7.0
            </p>
            <h2
              className="ml-[-0.04em] mt-2.5 max-w-[26ch] text-[clamp(26px,4.2vw,42px)] font-extrabold leading-[1.1] tracking-tight"
              data-reveal
            >
              A few frames from last season.
            </h2>
          </div>

          <Link
            href="/gallery"
            className="btn btn-secondary shrink-0"
            data-reveal
          >
            See all glimpses <span className="btn__arrow">→</span>
          </Link>
        </div>

        <div className="glimpses-strip mt-10" data-reveal>
          {PHOTOS.map((photo) => (
            <figure
              key={photo.src}
              className={`polaroid polaroid--${photo.rotate}`}
            >
              <div className="polaroid__photo">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 1024px) 230px, (min-width: 640px) 220px, 72vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="polaroid__caption">
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
