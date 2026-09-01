/**
 * Single source of truth for the season's facts — mirrored from the
 * Claude Design artboards. Change a date or a number here and it updates
 * across the landing page, the registration form and the footer.
 */
export const LEAGUE = {
  season: 8,
  dates: "13–15 November 2026",
  /** First ball, IST. Drives the countdown. */
  firstBallISO: "2026-11-13T18:00:00+05:30",
  firstBallLabel: "13 Nov 2026, 18:00",
  entriesClose: "31 October 2026",
  slotsOpen: 2,
  teamCount: 12,
  /* Tentative — quoted on the owner registration form. */
  entryFee: "Rs. 1.50 Lakhs",
  auctionDate: "13th December",
  email: "rtpl@roundtableindia.org",
  phone: "+91 98110 44112",
  beneficiary: "Freedom Through Education — Sonipat primary block",
  venue: {
    name: "Sector 44 Sports Complex",
    address:
      "Sector 44 Sports Complex, Huda City Centre Road, Gurugram, Haryana 122003",
    metro: "Huda City Centre (Yellow Line), 900 m — shuttles every 20 min",
    gates: "Open 90 minutes before first ball each day",
    mapsUrl: "https://maps.google.com/?q=Sector+44+Sports+Complex+Gurugram",
  },
} as const;
