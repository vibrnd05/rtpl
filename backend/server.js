import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 4000;

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
