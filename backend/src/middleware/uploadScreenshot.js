import multer from "multer";

export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const upload = multer({
  // Held in memory just long enough to stream to Cloudinary — the host's
  // disk is not storage.
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SCREENSHOT_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_TYPES.has(file.mimetype)) return cb(null, true);

    const err = new Error("Unsupported file type");
    err.code = "UNSUPPORTED_TYPE";
    cb(err);
  },
}).single("paymentScreenshot");

/** Parses the multipart entry and turns upload problems into form messages. */
export default function uploadScreenshot(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();

    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "The payment screenshot must be 5 MB or smaller."
        : err.code === "UNSUPPORTED_TYPE"
          ? "Upload the payment screenshot as a JPG, PNG, WEBP or HEIC image."
          : "The payment screenshot could not be read. Please try another image.";

    res.status(400).json({ error: err.message, message });
  });
}
