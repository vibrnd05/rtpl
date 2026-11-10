/**
 * Client for the RTPL Express API (see `backend/`).
 *
 * Only ever called from server components and server actions, so the base URL
 * is a private env var — the browser never talks to the API directly and the
 * backend needs no CORS entry for the site.
 */

/**
 * What a failed API response carries: `message` is written for the owner,
 * `error` is the underlying detail and is only ever logged.
 */
export type ApiErrorBody = {
  error?: string;
  message?: string;
};

export type ApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; message: string };

export function getApiBaseUrl(): string {
  const url = process.env.BACKEND_URL?.trim();

  if (!url) {
    throw new Error(
      "BACKEND_URL is not set. Copy frontend/.env.example to frontend/.env.local and point it at the Express API, e.g. http://localhost:4000."
    );
  }

  return url.replace(/\/+$/, "");
}

/** How long a server action waits on the API before giving up. */
const REQUEST_TIMEOUT_MS = 10_000;

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  // A FormData body sets its own multipart Content-Type, boundary included.
  const isMultipart = init.body instanceof FormData;

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(isMultipart ? {} : { "Content-Type": "application/json" }),
      ...init.headers,
    },
    // Registration is a mutation — never serve it from the data cache.
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const body = (await response.json().catch(() => null)) as unknown;

  if (response.ok) {
    return { ok: true, status: response.status, data: body as T };
  }

  const failure = body as ApiErrorBody | null;
  return {
    ok: false,
    status: response.status,
    error: failure?.error ?? `HTTP ${response.status}`,
    message:
      failure?.message ?? "The registration service returned an unexpected response.",
  };
}

/* -- Registrations -------------------------------------------------------- */

export type RegistrationPayload = {
  owners: string;
  ownersMobile: string;
  playerOwner: string;
  teamName: string;
  financialCommitment: string;
  mentor: string;
  auctionAvailability: string;
};

export type RegistrationReceipt = {
  registration: {
    reference: string;
    teamName: string;
    status: string;
    createdAt: string;
  };
};

export function submitRegistration(payload: RegistrationPayload) {
  return apiFetch<RegistrationReceipt>("/api/registrations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* -- Players ---------------------------------------------------------------- */

export type PlayerPayload = {
  fullName: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  city: string;
  lastYearTeam: string;
  membershipType: string;
  playingRole: string;
  tShirtSize: string;
  jerseyNumber: string;
  battingStyle: string;
  bowlingStyle: string;
  /** "true" or "false": multipart fields are strings, the model casts it. */
  availabilityConfirmed: string;
};

export type PlayerReceipt = {
  player: {
    reference: string;
    fullName: string;
    phase: string;
    fee: number;
    status: string;
    createdAt: string;
  };
};

/** Multipart, because the entry carries the player's picture and payment screenshot. */
export function submitPlayer(
  payload: PlayerPayload,
  playerPhoto: File,
  paymentScreenshot: File
) {
  const body = new FormData();

  for (const [key, value] of Object.entries(payload)) body.append(key, value);
  body.append("playerPhoto", playerPhoto, playerPhoto.name);
  body.append("paymentScreenshot", paymentScreenshot, paymentScreenshot.name);

  return apiFetch<PlayerReceipt>("/api/players", { method: "POST", body });
}

/** Whether player places are left. Null when the API could not be reached. */
export async function getPlayerAvailability(): Promise<{ open: boolean } | null> {
  try {
    const result = await apiFetch<{ open: boolean }>("/api/players/availability");
    return result.ok ? result.data : null;
  } catch {
    return null;
  }
}

/* -- Admin ---------------------------------------------------------------- */

export type AdminLoginReceipt = {
  token: string;
  /** Seconds the token stays valid — the session cookie is given the same life. */
  expiresIn: number;
};

export function adminLogin(username: string, password: string) {
  return apiFetch<AdminLoginReceipt>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/** Every field the dashboard shows, as the API returns it. */
export type Registration = {
  _id: string;
  reference: string;
  owners: string;
  ownersMobile: string;
  playerOwner: string;
  teamName: string;
  financialCommitment: string;
  mentor: string;
  auctionAvailability: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function listRegistrations(token: string) {
  return apiFetch<{ count: number; registrations: Registration[] }>(
    "/api/registrations",
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

/** Every field the dashboard shows, as the API returns it. */
export type Player = {
  _id: string;
  reference: string;
  fullName: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  city: string;
  lastYearTeam: string;
  membershipType: string;
  playingRole: string;
  tShirtSize: string;
  /** Empty for entries submitted before the number was asked for. */
  jerseyNumber?: string;
  battingStyle: string;
  bowlingStyle: string;
  phase: string;
  fee: number;
  status: string;
  /** Signed, so it only works for whoever the dashboard handed it to. */
  paymentScreenshotUrl?: string | null;
  /** Signed too. Empty for entries submitted before the picture was asked for. */
  playerPhotoUrl?: string | null;
  /** Payment screenshots an admin added from the dashboard, with signed links. */
  extraPaymentScreenshots?: { _id: string; url: string | null; uploadedAt: string }[];
  /** Set once an admin confirms the payment. */
  utr?: string;
  paymentConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export function listPlayers(token: string) {
  return apiFetch<{ count: number; players: Player[] }>("/api/players", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Admin only: adds payment screenshots to a player. */
export function addPlayerScreenshots(token: string, playerId: string, files: File[]) {
  const body = new FormData();
  for (const file of files) body.append("screenshots", file, file.name);

  return apiFetch<{ added: number; failed: number }>(
    `/api/players/${encodeURIComponent(playerId)}/payment-screenshots`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` }, body }
  );
}

/** Admin only: removes one admin-added payment screenshot. */
export function deletePlayerScreenshot(token: string, playerId: string, imageId: string) {
  return apiFetch<{ ok: true }>(
    `/api/players/${encodeURIComponent(playerId)}/payment-screenshots/${encodeURIComponent(imageId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
  );
}

export function confirmPlayerPayment(token: string, playerId: string, utr: string) {
  return apiFetch<{ player: Player; emailSent: boolean }>(
    `/api/players/${encodeURIComponent(playerId)}/confirm-payment`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ utr }),
    }
  );
}
