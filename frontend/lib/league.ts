/**
 * Single source of truth for the season's facts — mirrored from the
 * Claude Design artboards. Change a date or a number here and it updates
 * across the landing page, the registration form and the footer.
 */
export const LEAGUE = {
  season: 8,
  dates: "20–21 February 2027",
  /** First ball, IST. Drives the countdown. */
  firstBallISO: "2027-02-20T18:00:00+05:30",
  firstBallLabel: "20 Feb 2027, 18:00",
  entriesClose: "12 September 2026",
  slotsOpen: 2,
  teamCount: 5,
  entryFee: "Rs. 1.50 Lakhs",
  auctionDate: "13th December",
  email: "rtpl@roundtableindia.org",
  phone: "+91 98110 44112",
  venue: {
    name: "Maligaon Railway Stadium",
    address: "Maligaon Railway Stadium, Maligaon, Guwahati, Assam",
    gates: "Open 90 minutes before first ball each day",
    mapsUrl:
      "https://maps.google.com/?q=Maligaon+Railway+Stadium+Guwahati",
  },
} as const;
