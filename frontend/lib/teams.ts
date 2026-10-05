import fs from "fs";
import path from "path";

export type Team = {
  slug: string;
  name: string;
  logo: string;
  isChampion: boolean;
};

/** The slug (filename, minus extension) of last season's winning side. */
const CHAMPION_SLUG = "gully-boys";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function toTitleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/** Reads public/teams at build time — a new logo there needs no code change. */
export function getLastSeasonTeams(): Team[] {
  const dir = path.join(process.cwd(), "public", "teams");
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(dir)
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .sort();
  } catch {
    files = [];
  }

  return files.map((file) => {
    const slug = path.parse(file).name;
    return {
      slug,
      name: toTitleCase(slug),
      logo: `/teams/${file}`,
      isChampion: slug === CHAMPION_SLUG,
    };
  });
}
