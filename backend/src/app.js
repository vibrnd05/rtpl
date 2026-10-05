import express from "express";
import cors from "cors";
import registrationRoutes from "./routes/registration.routes.js";
import playerRoutes from "./routes/player.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const allowedOrigins = ["https://rtpl.vibrnd.in", "http://localhost:3000"];

const app = express();

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/players", playerRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `No route for ${req.method} ${req.originalUrl}.`,
  });
});

export default app;
