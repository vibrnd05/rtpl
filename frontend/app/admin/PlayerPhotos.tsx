"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/compressImage";
import { toast } from "@/components/Toaster";
import { removePlayerPhoto, uploadPlayerPhoto } from "./actions";

type Photo = { _id: string; url: string | null; uploadedAt: string };

/** Under Vercel's 4.5 MB request cap, with room for the form fields. */
const MAX_UPLOAD_BYTES = 4.2 * 1024 * 1024;

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

const LINK =
  "inline-block whitespace-nowrap text-[13px] font-semibold text-accent-700 underline hover:text-accent-600";

/**
 * The player's pictures in the dashboard: the main one (which an admin can
 * replace), plus any further ones an admin added, each deletable. Files go up
 * one per request, shrunk first, the same way as the payment screenshots.
 */
export function PlayerPhotos({
  playerId,
  playerName,
  mainUrl,
  photos,
}: {
  playerId: string;
  playerName: string;
  mainUrl?: string | null;
  photos: Photo[];
}) {
  const router = useRouter();
  const replaceRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function send(original: File, mode: "replace" | "add") {
    const file = await compressImage(original);
    if (file.size > MAX_UPLOAD_BYTES) return `${original.name} is too large.`;

    const data = new FormData();
    data.set("playerId", playerId);
    data.set("mode", mode);
    data.set("photo", file, file.name);

    try {
      const result = await uploadPlayerPhoto(data);
      return result.ok ? null : `${original.name}: ${result.message}`;
    } catch {
      return `${original.name} could not be uploaded.`;
    }
  }

  async function handleReplace(list: FileList | null) {
    const file = list?.[0];
    if (replaceRef.current) replaceRef.current.value = "";
    if (!file) return;

    setProgress("Uploading…");
    const failure = await send(file, "replace");
    setProgress(null);

    if (failure) toast(failure);
    else {
      toast(`Picture ${mainUrl ? "replaced" : "added"} for ${playerName}.`, "success");
      router.refresh();
    }
  }

  async function handleAdd(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (addRef.current) addRef.current.value = "";
    if (files.length === 0) return;

    let added = 0;
    const failures: string[] = [];

    for (const [i, file] of files.entries()) {
      setProgress(`Uploading ${i + 1} of ${files.length}…`);
      const failure = await send(file, "add");
      if (failure) failures.push(failure);
      else added++;
    }

    setProgress(null);
    if (added > 0) {
      toast(`${added} picture${added === 1 ? "" : "s"} added for ${playerName}.`, "success");
      router.refresh();
    }
    for (const failure of failures) toast(failure);
  }

  async function handleDelete(imageId: string) {
    setDeleting(imageId);
    try {
      const result = await removePlayerPhoto(playerId, imageId);
      toast(result.message, result.ok ? "success" : "error");
      if (result.ok) router.refresh();
    } catch {
      toast("Could not delete the picture. Please try again.");
    } finally {
      setDeleting(null);
      setConfirming(null);
    }
  }

  const busy = Boolean(progress);

  return (
    <div className="min-w-[200px]">
      {mainUrl && (
        <a
          href={mainUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Main picture"
          className="mb-1.5 inline-block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- signed Cloudinary link */}
          <img
            src={mainUrl}
            alt={`Picture of ${playerName}`}
            className="block h-16 w-16 border border-divider object-cover"
          />
        </a>
      )}

      {photos.length > 0 && (
        <ul className="m-0 mb-2 flex list-none flex-wrap gap-2 p-0">
          {photos.map((photo, i) => (
            <li key={photo._id} className="relative">
              {photo.url ? (
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Additional picture ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- signed Cloudinary link */}
                  <img
                    src={photo.url}
                    alt={`Additional picture ${i + 1} of ${playerName}`}
                    className="block h-12 w-12 border border-divider object-cover"
                  />
                </a>
              ) : (
                <span className="block h-12 w-12 border border-divider" />
              )}

              {confirming === photo._id ? (
                <button
                  type="button"
                  onClick={() => handleDelete(photo._id)}
                  disabled={deleting === photo._id}
                  className="absolute inset-x-0 bottom-0 cursor-pointer bg-accent py-0.5 text-[10.5px] font-bold text-paper"
                >
                  {deleting === photo._id ? "…" : "Delete?"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(photo._id)}
                  aria-label={`Delete additional picture ${i + 1}`}
                  className="absolute -right-1.5 -top-1.5 h-5 w-5 cursor-pointer rounded-full bg-paper text-[13px] leading-none text-ink ring-1 ring-divider hover:bg-accent hover:text-paper"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {progress ? (
        <p className="m-0 text-[13px] font-semibold text-ink/65">{progress}</p>
      ) : (
        <div className="flex flex-col items-start gap-1">
          <label className={`${LINK} cursor-pointer`}>
            {mainUrl ? "Replace picture" : "+ Upload picture"}
            <input
              ref={replaceRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              disabled={busy}
              onChange={(e) => handleReplace(e.target.files)}
            />
          </label>
          <label className={`${LINK} cursor-pointer`}>
            + Add more pictures
            <input
              ref={addRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="sr-only"
              disabled={busy}
              onChange={(e) => handleAdd(e.target.files)}
            />
          </label>
        </div>
      )}
    </div>
  );
}
