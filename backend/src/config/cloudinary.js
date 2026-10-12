import { randomUUID } from "crypto";
import { v2 as cloudinary } from "cloudinary";

/**
 * Payment screenshots carry bank details, so they are uploaded as
 * "authenticated" assets: the plain URL does not serve them, only a signed
 * one, and signed URLs are handed out to the admin dashboard alone.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const FOLDER = "rtpl/payment-screenshots";

/**
 * Uploads an image buffer; resolves to { publicId, format }. Named at random
 * rather than by entry reference, because the upload happens before the
 * entry is saved and its reference is final.
 */
export function uploadPaymentScreenshot(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        public_id: randomUUID(),
        type: "authenticated",
        resource_type: "image",
        overwrite: false,
        // Phone screenshots are often 3–4 MB; nobody needs more than this to
        // read a UTR off one.
        transformation: [
          { width: 1600, height: 1600, crop: "limit" },
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

/** Best-effort cleanup when the entry the screenshot belongs to is not saved. */
export async function deletePaymentScreenshot(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId, {
      type: "authenticated",
      resource_type: "image",
    });
  } catch (err) {
    console.error("[rtpl] could not delete orphaned screenshot", publicId, err);
  }
}

export function paymentScreenshotUrl(screenshot) {
  if (!screenshot?.publicId) return null;

  return cloudinary.url(screenshot.publicId, {
    type: "authenticated",
    resource_type: "image",
    format: screenshot.format,
    sign_url: true,
    secure: true,
  });
}
