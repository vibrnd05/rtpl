"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/compressImage";
import { toast } from "@/components/Toaster";
import { removePlayerScreenshot, uploadPlayerScreenshot } from "./actions";

type Screenshot = { _id: string; url: string | null; uploadedAt: string };

/** Under Vercel's 4.5 MB request cap, with room for the form fields. */
const MAX_UPLOAD_BYTES = 4.2 * 1024 * 1024;

/**
 * Admin-added payment screenshots for one player: thumbnails, a delete per
 * image, and a picker that takes several files at once. Files go up one per
 * request, shrunk first, so any number of them fits under the hosting limit.
 */
export function PaymentScreenshots({
  playerId,
  playerName,
  screenshots,
}: {
  playerId: string;
  playerName: string;
  screenshots: Screenshot[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;

    let added = 0;
    const failures: string[] = [];

    for (const [i, original] of files.entries()) {
      setProgress(`Uploading ${i + 1} of ${files.length}…`);

      const file = await compressImage(original);
      if (file.size > MAX_UPLOAD_BYTES) {
        failures.push(`${original.name} is too large.`);
        continue;
      }

      const data = new FormData();
      data.set("playerId", playerId);
      data.set("screenshot", file, file.name);

      try {
        const result = await uploadPlayerScreenshot(data);
        if (result.ok) added++;
        else failures.push(`${original.name}: ${result.message}`);
      } catch {
        failures.push(`${original.name} could not be uploaded.`);
      }
    }

    setProgress(null);
    if (added > 0) {
      toast(`${added} screenshot${added === 1 ? "" : "s"} added for ${playerName}.`, "success");
      router.refresh();
    }
    for (const failure of failures) toast(failure);
  }

  async function handleDelete(imageId: string) {
    setDeleting(imageId);
    try {
      const result = await removePlayerScreenshot(playerId, imageId);
      toast(result.message, result.ok ? "success" : "error");
      if (result.ok) router.refresh();
    } catch {
      toast("Could not delete the screenshot. Please try again.");
    } finally {
      setDeleting(null);
      setConfirming(null);
    }
  }

  return (
    <div className="mt-2 min-w-[220px]">
      {screenshots.length > 0 && (
        <ul className="m-0 mb-2 flex list-none flex-wrap gap-2 p-0">
          {screenshots.map((shot, i) => (
            <li key={shot._id} className="relative">
              {shot.url ? (
                <a
                  href={shot.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Admin screenshot ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- signed Cloudinary link */}
                  <img
                    src={shot.url}
                    alt={`Payment screenshot ${i + 1} for ${playerName}`}
                    className="block h-14 w-14 border border-divider object-cover"
                  />
                </a>
              ) : (
                <span className="block h-14 w-14 border border-divider" />
              )}

              {confirming === shot._id ? (
                <button
                  type="button"
                  onClick={() => handleDelete(shot._id)}
                  disabled={deleting === shot._id}
                  className="absolute inset-x-0 bottom-0 cursor-pointer bg-accent py-0.5 text-[10.5px] font-bold text-paper"
                >
                  {deleting === shot._id ? "…" : "Delete?"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(shot._id)}
                  aria-label={`Delete screenshot ${i + 1}`}
                  className="absolute -right-1.5 -top-1.5 h-5 w-5 cursor-pointer rounded-full bg-paper text-[13px] leading-none text-ink ring-1 ring-divider hover:bg-accent hover:text-paper"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <label
        className={`inline-block whitespace-nowrap text-[13px] font-semibold text-accent-700 underline hover:text-accent-600 ${
          progress ? "pointer-events-none opacity-60" : "cursor-pointer"
        }`}
      >
        {progress ?? "+ Add screenshots"}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="sr-only"
          disabled={Boolean(progress)}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
    </div>
  );
}
