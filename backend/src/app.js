import express from "express";
import cors from "cors";
import registrationRoutes from "./routes/registration.routes.js";

const allowedOrigins = ["https://rtpl.vibrnd.in", "http://localhost:3000"];

const app = express();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/registrations", registrationRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `No route for ${req.method} ${req.originalUrl}.`,
  });
});

export default app;
