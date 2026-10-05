import fs from "fs";
import path from "path";

export type GalleryPhoto = {
  src: string;
  alt: string;
};

export type GallerySection = {
  key: string;
  title: string;
  photos: GalleryPhoto[];
};

/** Order the days should appear in — not alphabetical ("day-1" < "launch"). */
const SECTIONS: { key: string; title: string }[] = [
  { key: "launch", title: "Launch Day" },
  { key: "day-1", title: "Day 1" },
  { key: "day-2", title: "Day 2" },
];

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * Reads whatever is actually in public/gallery/<section> at build time, so
 * dropping in or removing photos never needs a code change here.
 */
export function getGallerySections(): GallerySection[] {
  const galleryDir = path.join(process.cwd(), "public", "gallery");

  return SECTIONS.map(({ key, title }) => {
    const dir = path.join(galleryDir, key);
    let files: string[] = [];
    try {
      files = fs
        .readdirSync(dir)
        .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
        .sort();
    } catch {
      files = [];
    }

    const photos = files.map((file, index) => ({
      src: `/gallery/${key}/${file}`,
      alt: `${title} — photo ${index + 1}`,
    }));

    return { key, title, photos };
  }).filter((section) => section.photos.length > 0);
}
