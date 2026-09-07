import express from "express";
import {
  createRegistration,
  getRegistrations,
  getRegistrationById,
} from "../controllers/registration.controller.js";
import requireAdmin from "../middleware/requireAdmin.js";

const router = express.Router();

// Open — this is the owner registration form posting an entry.
router.post("/", createRegistration);

// Reading entries back is the admin dashboard's job, so both are gated.
router.get("/", requireAdmin, getRegistrations);
router.get("/:id", requireAdmin, getRegistrationById);

export default router;
