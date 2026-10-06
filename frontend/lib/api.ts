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
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
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
  team: string;
  lastYearTeam: string;
  membershipType: string;
  playingRole: string;
  tShirtSize: string;
  battingStyle: string;
  bowlingStyle: string;
};

export type PlayerReceipt = {
  player: {
    reference: string;
    fullName: string;
    team: string;
    status: string;
    createdAt: string;
  };
};

export function submitPlayer(payload: PlayerPayload) {
  return apiFetch<PlayerReceipt>("/api/players", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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
  team: string;
  lastYearTeam: string;
  membershipType: string;
  playingRole: string;
  tShirtSize: string;
  battingStyle: string;
  bowlingStyle: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function listPlayers(token: string) {
  return apiFetch<{ count: number; players: Player[] }>("/api/players", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
