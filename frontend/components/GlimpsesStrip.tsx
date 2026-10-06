import Link from "next/link";
import Image from "next/image";

type Polaroid = {
  src: string;
  alt: string;
  caption: string;
  rotate: "left" | "right";
  /** CSS aspect-ratio for the print — the two featured frames run wide,
      the rest are square. */
  ratio: string;
  sizes: string;
};

/** A handful of prints from last season, not the full set — that lives at /gallery. */
const PHOTOS: Polaroid[] = [
  {
    src: "/gallery/launch/TRK07888.JPG",
    alt: "The RTPL 7.0 trophy revealed on launch night",
    caption: "Launch night",
    rotate: "left",
    ratio: "6 / 5",
    sizes: "(min-width: 720px) 58vw, 100vw",
  },
  {
    src: "/gallery/day-1/TRK08154.JPG",
    alt: "A batter mid-shot on Day 1",
    caption: "Day 1, mid-over",
    rotate: "right",
    ratio: "6 / 5",
    sizes: "(min-width: 720px) 42vw, 100vw",
  },
  {
    src: "/gallery/day-1/TRK08216.JPG",
    alt: "A player walking out to bat",
    caption: "Game face on",
    rotate: "left",
    ratio: "1 / 1",
    sizes: "(min-width: 720px) 32vw, 48vw",
  },
  {
    src: "/gallery/day-2/TRK09506.JPG",
    alt: "A chapter side walking off the field together",
    caption: "The squad",
    rotate: "right",
    ratio: "1 / 1",
    sizes: "(min-width: 720px) 32vw, 48vw",
  },
  {
    src: "/gallery/launch/TRK07630.JPG",
    alt: "Two chapter members at the launch party",
    caption: "Launch party",
    rotate: "left",
    ratio: "1 / 1",
    sizes: "(min-width: 720px) 32vw, 48vw",
  },
];

/**
 * A scrapbook collage of prints from Season 7, dropped between the final
 * table and the CTA — this season's result is already written above it, so
 * this is what it looked like getting there. One frame held up large, the
 * rest scattered round it, the way photos actually end up pinned to a board
 * rather than lined up in a uniform strip. The full set lives at /gallery;
 * this is a taste of it, not a second copy.
 */
export function GlimpsesStrip() {
  return (
    <section className="glimpses" data-reveal-group>
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

        <div className="collage mt-10" data-reveal>
          {PHOTOS.map((photo) => (
            <figure
              key={photo.src}
              className={`collage__item polaroid polaroid--${photo.rotate}`}
            >
              <div
                className="polaroid__photo"
                style={{ "--polaroid-ratio": photo.ratio } as React.CSSProperties}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={photo.sizes}
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
