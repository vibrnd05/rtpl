import jwt from "jsonwebtoken";

/**
 * Stateless gate: the token carries the claim, so a valid signature is the
 * whole session. Nothing is stored server-side and nothing needs revoking —
 * the token simply stops verifying once it expires.
 */
export default function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({
      error: "No token",
      message: "Please sign in as an administrator.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({
        error: "Not an admin",
        message: "This account cannot view the entries.",
      });
    }

    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({
      error: "Invalid token",
      message: "Your session has expired. Please sign in again.",
    });
  }
}
