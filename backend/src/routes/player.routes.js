import express from "express";
import {
  createPlayer,
  getPlayers,
  getPlayerById,
  confirmPlayerPayment,
} from "../controllers/player.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";
import uploadScreenshot from "../middleware/uploadScreenshot.js";

const router = express.Router();

// Open — this is the player registration form posting an entry.
// Multipart: the entry's fields plus the payment screenshot.
router.post("/", uploadScreenshot, createPlayer);

// Reading entries back is the admin dashboard's job, so both are gated.
router.get("/", requireAdmin, getPlayers);
router.get("/:id", requireAdmin, getPlayerById);

router.post("/:id/confirm-payment", requireAdmin, confirmPlayerPayment);

export default router;
