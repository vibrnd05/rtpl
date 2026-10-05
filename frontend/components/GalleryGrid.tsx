"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GallerySection } from "@/lib/gallery";

type FlatPhoto = {
  src: string;
  alt: string;
  sectionTitle: string;
};

export function GalleryGrid({ sections }: { sections: GallerySection[] }) {
  const flatPhotos = useMemo<FlatPhoto[]>(
    () =>
      sections.flatMap((section) =>
        section.photos.map((photo) => ({
          ...photo,
          sectionTitle: section.title,
        })),
      ),
    [sections],
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const showPrev = useCallback(() => {
    setActiveIndex((current) =>
      current === null
        ? null
        : (current - 1 + flatPhotos.length) % flatPhotos.length,
    );
  }, [flatPhotos.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % flatPhotos.length,
    );
  }, [flatPhotos.length]);

  // Keyboard nav and a scroll lock, live only while the lightbox is open.
  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close, showPrev, showNext]);

  let sectionStart = 0;

  return (
    <>
      {sections.map((section) => {
        const startIndex = sectionStart;
        sectionStart += section.photos.length;

        return (
          <section key={section.key} className="mb-12" data-reveal-group>
            <h2
              className="mb-3.5 text-[13px] font-extrabold uppercase tracking-[0.1em] text-accent-700"
              data-reveal
            >
              {section.title}
              <span className="ml-2 font-semibold tracking-normal text-ink/50">
                · {section.photos.length} photos
              </span>
            </h2>

            <div className="gallery-grid" data-reveal>
              {section.photos.map((photo, index) => (
                <button
                  key={photo.src}
                  type="button"
                  className="gallery-thumb"
                  onClick={() => setActiveIndex(startIndex + index)}
                  aria-label={`Open photo: ${photo.alt}`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 23vw, 32vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {activeIndex !== null && (
        <Lightbox
          photo={flatPhotos[activeIndex]}
          index={activeIndex}
          total={flatPhotos.length}
          onClose={close}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </>
  );
}

function Lightbox({
  photo,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  photo: FlatPhoto;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox__close"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        ✕
      </button>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--prev"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
        aria-label="Previous photo"
      >
        ‹
      </button>

      <div
        className="lightbox__frame"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          className="object-contain"
          priority
        />
      </div>

      <button
        type="button"
        className="lightbox__nav lightbox__nav--next"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
      >
        ›
      </button>

      <p className="lightbox__caption">
        {photo.sectionTitle} · {index + 1} / {total}
      </p>
    </div>
  );
}
