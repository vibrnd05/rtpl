import jwt from "jsonwebtoken";

/** How long an admin session lasts before the token stops verifying. */
export const TOKEN_TTL_SECONDS = 8 * 60 * 60;

/**
 * There is one admin and the credentials live in the environment, so there is
 * no user collection and nothing to look up — the check is a comparison.
 */
export const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      error: "Invalid credentials",
      message: "That username and password do not match.",
    });
  }

  const token = jwt.sign({ role: "admin", username }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL_SECONDS,
  });

  res.json({ token, expiresIn: TOKEN_TTL_SECONDS });
};
