/**
 * Browser-only: shrinks a phone photo before it is uploaded.
 *
 * Vercel refuses request bodies over 4.5 MB before the server action ever
 * runs, and a camera photo plus a payment screenshot can exceed that on their
 * own. Re-encoding to a 1600px JPEG brings a typical photo well under 1 MB.
 *
 * Anything the browser cannot decode (HEIC outside Safari, for instance) is
 * returned untouched, so this never blocks a submission — the size checks
 * after it decide whether the file can go.
 */

const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.82;
/** Small files are left alone; re-encoding them gains nothing. */
const SKIP_BELOW_BYTES = 600 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (file.size < SKIP_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG has no alpha; paint white so transparent PNGs don't turn black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
