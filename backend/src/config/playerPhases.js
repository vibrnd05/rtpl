/**
 * Player entry phases, in the order they fill. Entries are assigned by
 * position: the first 60 get the phase 1 fee, the next 5 phase 2, the next
 * 5 phase 3, and the last 5 are reserve places.
 *
 * Reserve is the last phase, so it only opens once the 70 main entries are
 * taken, and the season closes at MAX_PLAYERS.
 */
export const PLAYER_PHASES = [
  { key: "phase-1", label: "Phase 1", size: 60, fee: 7500 },
  { key: "phase-2", label: "Phase 2", size: 5, fee: 8000 },
  { key: "phase-3", label: "Phase 3", size: 5, fee: 8000 },
  { key: "reserve", label: "Reserve", size: 5, fee: 8000 },
];

export const MAX_PLAYERS = PLAYER_PHASES.reduce((sum, phase) => sum + phase.size, 0);

/**
 * The phase that the entry at `position` (zero-based count of entries already
 * taken) falls into, or null once every place is filled.
 */
export function phaseForPosition(position) {
  let start = 0;

  for (const phase of PLAYER_PHASES) {
    if (position < start + phase.size) return phase;
    start += phase.size;
  }

  return null;
}
