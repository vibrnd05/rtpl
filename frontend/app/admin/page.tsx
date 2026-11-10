import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { DownloadExcelButton } from "@/components/DownloadExcelButton";
import { getAdminToken } from "@/lib/adminSession";
import {
  listRegistrations,
  listPlayers,
  type Registration,
  type Player,
} from "@/lib/api";
import { LEAGUE } from "@/lib/league";
import { signOut } from "./actions";
import { ConfirmPaymentForm } from "./ConfirmPaymentForm";
import { PaymentScreenshots } from "./PaymentScreenshots";

export const metadata: Metadata = {
  title: "Entries - RTPL admin",
  robots: { index: false, follow: false },
};

/** The cookie is read every request, so this page can never be prerendered. */
export const dynamic = "force-dynamic";

const OWNER_COLUMNS = [
  "#",
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
  "#",
  "Reference",
  "Name",
  "Picture",
  "City",
  "Last year",
  "Membership",
  "Mobile",
  "Email",
  "DOB",
  "Role",
  "Batting",
  "Bowling",
  "T-shirt",
  "Jersey no.",
  "Fee",
  "Status",
  "Payment",
  "Submitted",
];

/**
 * Registration order: the earliest entry is 1. The list arrives newest first,
 * so the number is worked out from the submission times, not the row position.
 */
function registrationNumbers(entries: { _id: string; createdAt: string }[]) {
  const ordered = [...entries].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  return new Map(ordered.map((entry, i) => [entry._id, i + 1]));
}

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

function OwnerRow({ entry, number }: { entry: Registration; number: number }) {
  return (
    <tr>
      <td className="tnum whitespace-nowrap text-ink/70">{number}</td>
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

function PlayerRow({ entry, number }: { entry: Player; number: number }) {
  // Green once an admin has confirmed the payment by hand.
  const confirmed = entry.status === "confirmed";
  return (
    <tr
      className={confirmed ? "bg-[#3fb27f]/15 [&>td]:border-[#3fb27f]/35" : undefined}
    >
      <td className="tnum whitespace-nowrap text-ink/70">{number}</td>
      <td className="tnum whitespace-nowrap font-semibold text-accent-700">
        {entry.reference}
      </td>
      <td className="min-w-[160px] font-semibold">{entry.fullName}</td>
      <td>
        {entry.playerPhotoUrl && (
          <a
            href={entry.playerPhotoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-[13.5px] font-semibold text-accent-700 underline hover:text-accent-600"
          >
            View picture ↗
          </a>
        )}
      </td>
      <td>{entry.city}</td>
      <td>{entry.lastYearTeam}</td>
      <td>{entry.membershipType}</td>
      <td className="tnum whitespace-nowrap">{entry.mobile}</td>
      <td className="min-w-[180px] text-ink/80">{entry.email}</td>
      <td className="tnum whitespace-nowrap">{formatDay(entry.dateOfBirth)}</td>
      <td>{entry.playingRole}</td>
      <td>{entry.battingStyle}</td>
      <td>{entry.bowlingStyle}</td>
      <td>{entry.tShirtSize}</td>
      <td className="tnum">{entry.jerseyNumber}</td>
      <td className="tnum whitespace-nowrap">
        Rs. {entry.fee.toLocaleString("en-IN")}
      </td>
      <td className="capitalize">{entry.status}</td>
      <td>
        {entry.paymentScreenshotUrl && (
          <a
            href={entry.paymentScreenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 inline-block whitespace-nowrap text-[13.5px] font-semibold text-accent-700 underline hover:text-accent-600"
          >
            View screenshot ↗
          </a>
        )}
        {entry.status === "confirmed" ? (
          <div className="whitespace-nowrap">
            <p className="tnum m-0 font-semibold">UTR {entry.utr}</p>
            {entry.paymentConfirmedAt && (
              <p className="m-0 text-xs text-ink/65">
                {formatDate(entry.paymentConfirmedAt)}
              </p>
            )}
          </div>
        ) : (
          <ConfirmPaymentForm
            playerId={entry._id}
            playerName={entry.fullName}
          />
        )}
        <PaymentScreenshots
          playerId={entry._id}
          playerName={entry.fullName}
          screenshots={entry.extraPaymentScreenshots ?? []}
        />
      </td>
      <td className="tnum whitespace-nowrap text-ink/70">
        {formatDate(entry.createdAt)}
      </td>
    </tr>
  );
}

function ownerExportRow(entry: Registration, number: number) {
  return {
    "#": number,
    Reference: entry.reference,
    Team: entry.teamName,
    Owners: entry.owners,
    Mobile: entry.ownersMobile,
    "Player-owner": entry.playerOwner,
    Financial: entry.financialCommitment,
    Mentor: entry.mentor,
    Auction: entry.auctionAvailability,
    Status: entry.status,
    Submitted: formatDate(entry.createdAt),
  };
}

function playerExportRow(entry: Player, number: number) {
  return {
    "#": number,
    Reference: entry.reference,
    Name: entry.fullName,
    City: entry.city,
    "Last year": entry.lastYearTeam,
    Membership: entry.membershipType,
    Mobile: entry.mobile,
    Email: entry.email,
    DOB: formatDay(entry.dateOfBirth),
    Role: entry.playingRole,
    Batting: entry.battingStyle,
    Bowling: entry.bowlingStyle,
    "T-shirt": entry.tShirtSize,
    "Jersey no.": entry.jerseyNumber ?? "",
    Fee: entry.fee,
    Status: entry.status,
    UTR: entry.utr ?? "",
    "Payment confirmed": entry.paymentConfirmedAt
      ? formatDate(entry.paymentConfirmedAt)
      : "",
    Submitted: formatDate(entry.createdAt),
  };
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
  const playerNumbers = registrationNumbers(players);
  const ownerNumbers = registrationNumbers(owners);

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
            <div className="flex items-center gap-4">
              <p className="tnum m-0 text-[14px] text-ink/70">
                {players.length} {players.length === 1 ? "player" : "players"}{" "}
                registered.
              </p>
              <DownloadExcelButton
                rows={players.map((e) => playerExportRow(e, playerNumbers.get(e._id) ?? 0))}
                filename="rtpl-player-entries"
                sheetName="Players"
              />
            </div>
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
                    <PlayerRow
                      key={entry._id}
                      entry={entry}
                      number={playerNumbers.get(entry._id) ?? 0}
                    />
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
            <div className="flex items-center gap-4">
              <p className="tnum m-0 text-[14px] text-ink/70">
                {owners.length} {owners.length === 1 ? "entry" : "entries"}{" "}
                received.
              </p>
              <DownloadExcelButton
                rows={owners.map((e) => ownerExportRow(e, ownerNumbers.get(e._id) ?? 0))}
                filename="rtpl-owner-entries"
                sheetName="Owners"
              />
            </div>
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
                    <OwnerRow
                      key={entry._id}
                      entry={entry}
                      number={ownerNumbers.get(entry._id) ?? 0}
                    />
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
