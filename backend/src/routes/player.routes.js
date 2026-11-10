import express from "express";
import {
  createPlayer,
  getPlayers,
  getPlayerById,
  confirmPlayerPayment,
  getPlayerAvailability,
} from "../controllers/player.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadEntryImages from "../middleware/uploadEntryImages.js";

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

export default router;
