import multer from "multer";
import { MAX_IMAGE_BYTES } from "./uploadEntryImages.js";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/** Generous, but bounded, so one request cannot flood memory. */
const MAX_FILES = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_TYPES.has(file.mimetype)) return cb(null, true);

    const err = new Error("Unsupported file type");
    err.code = "UNSUPPORTED_TYPE";
    cb(err);
  },
}).array("screenshots", MAX_FILES);

/** Parses the admin's screenshots. Mounted after requireAdmin, never before. */
export default function uploadAdminScreenshots(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();

    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each screenshot must be 5 MB or smaller."
        : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
          ? `Upload at most ${MAX_FILES} screenshots at a time.`
          : err.code === "UNSUPPORTED_TYPE"
            ? "Screenshots must be JPG, PNG, WEBP or HEIC images."
            : "That file could not be read. Please try another image.";

    res.status(400).json({ error: err.message, message });
  });
}
