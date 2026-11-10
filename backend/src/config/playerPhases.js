/**
 * One fee for every player and a hard cap on entries. The 76th submission is
 * refused — see claimPlayerPlace in the player controller for how the cap
 * holds even when entries arrive at the same moment.
 */
export const PLAYER_FEE = 7500;
export const MAX_PLAYERS = 75;

/**
 * Entries still carry a `phase`, so the field, older entries and the emails
 * keep working. There is only one phase now.
 */
export const PLAYER_PHASES = [{ key: "phase-1", label: "Phase 1", fee: PLAYER_FEE }];
