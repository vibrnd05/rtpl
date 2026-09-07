import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { getAdminToken } from "@/lib/adminSession";
import { listRegistrations, type Registration } from "@/lib/api";
import { LEAGUE } from "@/lib/league";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Entries - RTPL admin",
  robots: { index: false, follow: false },
};

/** The cookie is read every request, so this page can never be prerendered. */
export const dynamic = "force-dynamic";

const COLUMNS = [
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

function Row({ entry }: { entry: Registration }) {
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

export default async function AdminDashboardPage() {
  const token = await getAdminToken();
  if (!token) redirect("/admin/login");

  const result = await listRegistrations(token);

  // The API is the only thing that can judge the token, and it just did.
  if (!result.ok && result.status === 401) redirect("/admin/login");

  const entries = result.ok ? result.data.registrations : [];

  return (
    <>
      <SiteHeader variant="back" />

      <div className="shell">
        <section className="pb-9 pt-[clamp(36px,5vw,64px)]">
          <p className="eyebrow mb-5">Season {LEAGUE.season} · Tournament desk</p>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="ml-[-0.058em] text-[clamp(34px,5vw,58px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
                Owner entries
              </h1>
              <p className="tnum mt-4 m-0 text-[15.5px] text-ink/75">
                {entries.length} {entries.length === 1 ? "entry" : "entries"}{" "}
                received.
              </p>
            </div>

            <form action={signOut}>
              <button type="submit" className="btn btn-secondary">
                Sign out
              </button>
            </form>
          </div>
        </section>

        <hr className="rule" />

        <section className="pb-[clamp(48px,6vw,80px)] pt-8">
          {!result.ok ? (
            <p className="m-0 text-[15px] text-accent-700">{result.message}</p>
          ) : entries.length === 0 ? (
            <p className="m-0 text-[15px] text-ink/70">
              No entries yet. They will appear here as owners submit the form.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    {COLUMNS.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <Row key={entry._id} entry={entry} />
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
