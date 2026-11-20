import express from "express";
import { getAuctionPlayers } from "../controllers/player.controller.js";
import requireApiKey from "../middleware/requireApiKey.js";

const router = express.Router();

// Server-to-server only: the auction site's backend calls this with its key.
router.get("/players", requireApiKey, getAuctionPlayers);

export default router;
