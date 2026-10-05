import express from "express";
import {
  createPlayer,
  getPlayers,
  getPlayerById,
} from "../controllers/player.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

// Open — this is the player registration form posting an entry.
router.post("/", createPlayer);

// Reading entries back is the admin dashboard's job, so both are gated.
router.get("/", requireAdmin, getPlayers);
router.get("/:id", requireAdmin, getPlayerById);

export default router;
