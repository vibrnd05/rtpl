import { timingSafeEqual } from "crypto";

/**
 * Gate for the auction site's server-to-server feed. The key lives in the
 * environment on both sides and is never sent to a browser. With no key
 * configured the feed stays shut rather than falling open.
 */
export default function requireApiKey(req, res, next) {
  const expected = process.env.AUCTION_API_KEY;

  if (!expected) {
    return res.status(503).json({
      error: "Not configured",
      message: "The player feed is not configured.",
    });
  }

  const given = Buffer.from(String(req.get("x-api-key") ?? ""));
  const want = Buffer.from(expected);

  // timingSafeEqual needs equal lengths; the length check leaks only length.
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return res.status(401).json({
      error: "Invalid API key",
      message: "A valid X-API-Key header is required.",
    });
  }

  next();
}
