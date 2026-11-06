import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";

/**
 * Entry images are personal — payment screenshots carry bank details, player
 * pictures are of the player — so both are uploaded as "authenticated" assets:
 * the plain URL does not serve them, only a signed one, and signed URLs are
 * handed out to the admin dashboard alone.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const PAYMENT_SCREENSHOT_FOLDER = "rtpl/payment-screenshots";
const PLAYER_PHOTO_FOLDER = "rtpl/player-photos";

/**
 * Uploads an image buffer; resolves to { publicId, format }. Named at random
 * rather than by entry reference, because the upload happens before the
 * entry is saved and its reference is final.
 */
function uploadImage(buffer, folder, maxDimension) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: randomUUID(),
        type: "authenticated",
        resource_type: "image",
        overwrite: false,
        transformation: [
          { width: maxDimension, height: maxDimension, crop: "limit" },
          { quality: "auto", fetch_format: "jpg" },
        ],
      },
      (err, result) =>
        err
          ? reject(err)
          : resolve({ publicId: result.public_id, format: result.format })
    );

    stream.end(buffer);
  });
}

/**
 * Phone screenshots are often 3–4 MB; nobody needs more than 1600px to read a
 * UTR off one.
 */
export function uploadPaymentScreenshot(buffer) {
  return uploadImage(buffer, PAYMENT_SCREENSHOT_FOLDER, 1600);
}

/** Kept larger than a screenshot, so it still holds up on a team poster. */
export function uploadPlayerPhoto(buffer) {
  return uploadImage(buffer, PLAYER_PHOTO_FOLDER, 2400);
}

/** Best-effort cleanup when the entry the image belongs to is not saved. */
export async function deleteEntryImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId, {
      type: "authenticated",
      resource_type: "image",
    });
  } catch (err) {
    console.error("[rtpl] could not delete orphaned image", publicId, err);
  }
}

/** A signed link to an entry image, or null for an entry without that image. */
export function entryImageUrl(image) {
  if (!image?.publicId) return null;

  return cloudinary.url(image.publicId, {
    type: "authenticated",
    resource_type: "image",
    format: image.format,
    sign_url: true,
    secure: true,
  });
}
