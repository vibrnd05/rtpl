/**
 * Answer options for the player registration form.
 *
 * Mirrored by hand in backend/src/models/player.model.js, where the API
 * validator and the Mongoose schema enforce them — the same split the
 * owner-form YES_NO constants in lib/registration.ts already use.
 */
export const PLAYING_ROLES = [
  "Batsman",
  "Bowler",
  "All-rounder",
  "Wicketkeeper",
] as const;

export const T_SHIRT_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"] as const;

export const MEMBERSHIP_TYPES = ["Tabler", "41er"] as const;

export const BATTING_STYLES = ["Right-handed", "Left-handed"] as const;

export const BOWLING_STYLES = ["Pace", "Spin", "Does not bowl"] as const;
