import express from "express";
import {
  createRegistration,
  getRegistrations,
  getRegistrationById,
} from "../controllers/registration.controller.js";

const router = express.Router();

router.post("/", createRegistration);
router.get("/", getRegistrations);
router.get("/:id", getRegistrationById);

export default router;
