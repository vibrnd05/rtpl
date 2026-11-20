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

/**
 * Builds a parser for images an admin uploads from the dashboard. `field` is
 * the multipart field name; `noun` ("screenshots", "pictures") words the
 * error messages. Mounted after requireAdmin, never before.
 */
export function uploadAdminImages(field, noun, maxFiles = MAX_FILES) {
  const one = noun.replace(/s$/, "");
  const Noun = noun[0].toUpperCase() + noun.slice(1);

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_BYTES, files: maxFiles },
    fileFilter: (_req, file, cb) => {
      if (IMAGE_TYPES.has(file.mimetype)) return cb(null, true);

      const err = new Error("Unsupported file type");
      err.code = "UNSUPPORTED_TYPE";
      cb(err);
    },
  }).array(field, maxFiles);

  return function uploadAdminImagesMiddleware(req, res, next) {
    upload(req, res, (err) => {
      if (!err) return next();

      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? `Each ${one} must be 5 MB or smaller.`
          : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
            ? maxFiles === 1
              ? `Upload one ${one} at a time.`
              : `Upload at most ${maxFiles} ${noun} at a time.`
            : err.code === "UNSUPPORTED_TYPE"
              ? `${Noun} must be JPG, PNG, WEBP or HEIC images.`
              : "That file could not be read. Please try another image.";

      res.status(400).json({ error: err.message, message });
    });
  };
}

/** Parses the admin's payment screenshots. */
const uploadAdminScreenshots = uploadAdminImages("screenshots", "screenshots");

export default uploadAdminScreenshots;
