import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 4000;

// Fail here rather than at the first login attempt, where a missing secret
// would look like a server fault instead of a missing line in .env.
for (const key of ["JWT_SECRET", "ADMIN_USERNAME", "ADMIN_PASSWORD"]) {
  if (!process.env[key]) {
    console.error(`[rtpl] ${key} is not set — admin login cannot work.`);
    process.exit(1);
  }
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[rtpl] api listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[rtpl] failed to connect to mongodb", err);
    process.exit(1);
  });
