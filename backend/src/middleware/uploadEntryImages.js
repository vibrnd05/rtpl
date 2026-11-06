import multer from "multer";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

/** How each file is named when telling the player something is wrong with it. */
const FIELD_LABELS = {
  playerPhoto: "Your picture",
  paymentScreenshot: "The payment screenshot",
};

const upload = multer({
  // Held in memory just long enough to stream to Cloudinary — the host's
  // disk is not storage.
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 2 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_TYPES.has(file.mimetype)) return cb(null, true);

    const err = new Error("Unsupported file type");
    err.code = "UNSUPPORTED_TYPE";
    err.field = file.fieldname;
    cb(err);
  },
}).fields([
  { name: "playerPhoto", maxCount: 1 },
  { name: "paymentScreenshot", maxCount: 1 },
]);

/** Parses the multipart entry and turns upload problems into form messages. */
export default function uploadEntryImages(req, res, next) {
  upload(req, res, (err) => {
    if (!err) return next();

    const label = FIELD_LABELS[err.field] || "That file";

    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `${label} must be 5 MB or smaller.`
        : err.code === "UNSUPPORTED_TYPE"
          ? `${label} must be a JPG, PNG, WEBP or HEIC image.`
          : `${label} could not be read. Please try another image.`;

    res.status(400).json({ error: err.message, message });
  });
}
