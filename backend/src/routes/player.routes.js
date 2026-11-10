import express from "express";
import {
  createPlayer,
  getPlayers,
  getPlayerById,
  confirmPlayerPayment,
  getPlayerAvailability,
  addPaymentScreenshots,
  deletePaymentScreenshot,
} from "../controllers/player.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadEntryImages from "../middleware/uploadEntryImages.js";
import uploadAdminScreenshots from "../middleware/uploadAdminScreenshots.js";

const router = express.Router();

// Open — this is the player registration form posting an entry.
// Multipart: the entry's fields plus the player's picture and payment screenshot.
router.post("/", uploadEntryImages, createPlayer);

// Open, and before /:id so it is not read as an id: whether places are left.
router.get("/availability", getPlayerAvailability);

// Reading entries back is the admin dashboard's job, so both are gated.
router.get("/", requireAdmin, getPlayers);
router.get("/:id", requireAdmin, getPlayerById);

router.post("/:id/confirm-payment", requireAdmin, confirmPlayerPayment);

// Admin only. requireAdmin runs before the upload is even parsed, so nobody
// without a valid admin token can push a file through.
router.post(
  "/:id/payment-screenshots",
  requireAdmin,
  uploadAdminScreenshots,
  addPaymentScreenshots
);
router.delete("/:id/payment-screenshots/:imageId", requireAdmin, deletePaymentScreenshot);

export default router;
