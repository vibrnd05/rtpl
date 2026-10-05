import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getAdminToken } from "@/lib/adminSession";
import {
  listRegistrations,
  listPlayers,
  type Registration,
  type Player,
} from "@/lib/api";
import { LEAGUE } from "@/lib/league";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Entries - RTPL admin",
  robots: { index: false, follow: false },
};

/** The cookie is read every request, so this page can never be prerendered. */
export const dynamic = "force-dynamic";

const OWNER_COLUMNS = [
  "Reference",
  "Team",
  "Owners",
  "Mobile",
  "Player-owner",
  "Financial",
  "Mentor",
  "Auction",
  "Status",
  "Submitted",
];

const PLAYER_COLUMNS = [
  "Reference",
  "Name",
  "Team",
  "Mobile",
  "Email",
  "DOB",
  "Role",
  "T-shirt",
  "Table no.",
  "Status",
  "Submitted",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata",
  });
}

function OwnerRow({ entry }: { entry: Registration }) {
  return (
    <tr>
      <td className="tnum whitespace-nowrap font-semibold text-accent-700">
        {entry.reference}
      </td>
      <td className="font-semibold">{entry.teamName}</td>
      <td className="min-w-[260px] whitespace-pre-line text-ink/80">
        {entry.owners}
      </td>
      <td className="tnum whitespace-nowrap">{entry.ownersMobile}</td>
      <td className="min-w-[160px] text-ink/80">{entry.playerOwner}</td>
      <td>{entry.financialCommitment}</td>
      <td>{entry.mentor}</td>
      <td>{entry.auctionAvailability}</td>
      <td className="capitalize">{entry.status}</td>
      <td className="tnum whitespace-nowrap text-ink/70">
        {formatDate(entry.createdAt)}
      </td>
    </tr>
  );
}

function PlayerRow({ entry }: { entry: Player }) {
  return (
    <tr>
      <td className="tnum whitespace-nowrap font-semibold text-accent-700">
        {entry.reference}
      </td>
      <td className="min-w-[160px] font-semibold">{entry.fullName}</td>
      <td>{entry.team}</td>
      <td className="tnum whitespace-nowrap">{entry.mobile}</td>
      <td className="min-w-[180px] text-ink/80">{entry.email}</td>
      <td className="tnum whitespace-nowrap">{formatDay(entry.dateOfBirth)}</td>
      <td>{entry.playingRole}</td>
      <td>{entry.tShirtSize}</td>
      <td>{entry.tableNumber || "—"}</td>
      <td className="capitalize">{entry.status}</td>
      <td className="tnum whitespace-nowrap text-ink/70">
        {formatDate(entry.createdAt)}
      </td>
    </tr>
  );
}

export default async function AdminDashboardPage() {
  const token = await getAdminToken();
  if (!token) redirect("/admin/login");

  const [ownerResult, playerResult] = await Promise.all([
    listRegistrations(token),
    listPlayers(token),
  ]);

  // The API is the only thing that can judge the token, and it just did.
  if (
    (!ownerResult.ok && ownerResult.status === 401) ||
    (!playerResult.ok && playerResult.status === 401)
  ) {
    redirect("/admin/login");
  }

  const owners = ownerResult.ok ? ownerResult.data.registrations : [];
  const players = playerResult.ok ? playerResult.data.players : [];

  return (
    <>
      <SiteHeader variant="back" />

      <div className="shell">
        <section className="pb-9 pt-[clamp(36px,5vw,64px)]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-5">
                Season {LEAGUE.season} · Tournament desk
              </p>
              <h1 className="ml-[-0.058em] text-[clamp(34px,5vw,58px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
                Entries
              </h1>
            </div>

            <form action={signOut}>
              <button type="submit" className="btn btn-secondary">
                Sign out
              </button>
            </form>
          </div>
        </section>

        <hr className="rule" />

        {/* Players */}
        <section className="pb-[clamp(44px,6vw,72px)] pt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[20px] font-extrabold tracking-[-0.01em]">
              Player entries
            </h2>
            <p className="tnum m-0 text-[14px] text-ink/70">
              {players.length} {players.length === 1 ? "player" : "players"}{" "}
              registered.
            </p>
          </div>

          {!playerResult.ok ? (
            <p className="m-0 text-[15px] text-accent-700">
              {playerResult.message}
            </p>
          ) : players.length === 0 ? (
            <p className="m-0 text-[15px] text-ink/70">
              No players yet. They will appear here as players submit the
              form.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    {PLAYER_COLUMNS.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {players.map((entry) => (
                    <PlayerRow key={entry._id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <hr className="rule" />

        {/* Owners */}
        <section className="pb-[clamp(48px,6vw,80px)] pt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[20px] font-extrabold tracking-[-0.01em]">
              Owner entries
            </h2>
            <p className="tnum m-0 text-[14px] text-ink/70">
              {owners.length} {owners.length === 1 ? "entry" : "entries"}{" "}
              received.
            </p>
          </div>

          {!ownerResult.ok ? (
            <p className="m-0 text-[15px] text-accent-700">
              {ownerResult.message}
            </p>
          ) : owners.length === 0 ? (
            <p className="m-0 text-[15px] text-ink/70">
              No entries yet. They will appear here as owners submit the
              form.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    {OWNER_COLUMNS.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {owners.map((entry) => (
                    <OwnerRow key={entry._id} entry={entry} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
