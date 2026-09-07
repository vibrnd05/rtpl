/**
 * The admin session, as a cookie.
 *
 * The JWT is signed by the Express API and then parked in an httpOnly cookie
 * on this site's own domain — the browser never sees it and never sends it
 * anywhere but here. Server components read it back out and forward it to the
 * API as a bearer token, which keeps the rule the rest of the app follows:
 * only the Next server talks to the backend.
 */
import { cookies } from "next/headers";

const COOKIE = "rtpl_admin";

export async function setAdminToken(token: string, maxAge: number) {
  const jar = await cookies();

  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function getAdminToken() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value ?? "";
}

export async function clearAdminToken() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
