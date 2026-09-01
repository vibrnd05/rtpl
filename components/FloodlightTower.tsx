/**
 * A stadium floodlight pylon: a tapered lattice mast running up into a tilted
 * cluster of lamps, drawn as a silhouette a couple of steps above the page
 * ground so it reads as structure without competing with the headline in front
 * of it.
 *
 * There is deliberately no housing at the top — no frame, no reflector rims,
 * no fittings. The head is two blurred passes of the same lamp grid: a wide
 * coloured bloom, then a tighter near-white core on top of it. So the tower
 * ends in light rather than in hardware, which is the whole point of the
 * treatment; adding a frame back would undo it.
 *
 * The lattice is generated rather than drawn by hand — the legs are two
 * straight lines from a wide base to a narrow top, and the bracing is the
 * zigzag between them, so changing `BAYS` or the leg coordinates re-rigs the
 * whole tower without anyone editing a path.
 *
 * `tone` picks which tower this is: the warm one on the left of the hero, the
 * cool one on the right. It also namespaces the filter id, which matters —
 * two instances sharing an id would make the second one's glow reference the
 * first one's filter.
 *
 * The cluster's centre is what the hero's gradients aim at. It sits at roughly
 * 48.2% across and 13.8% down this viewBox once the -9deg tilt is applied, and
 * --flood-x / --flood-y in globals.css are derived from that. Resize the lamp
 * grid and those two need recomputing, or the beams stop leaving the lamps.
 */

const VB = { w: 200, h: 660 };

/** Mast legs: [x at the base, x at the head]. */
const LEG_L = { bottom: 66, top: 96 };
const LEG_R = { bottom: 142, top: 112 };
const MAST_TOP = 150;
const BAYS = 13;

const TONE = {
  warm: { lamp: "var(--color-gold)", core: "#fff4d6" },
  cool: { lamp: "#dce9ff", core: "#ffffff" },
} as const;

function lattice() {
  // Node positions down each leg, from the head to the base.
  const at = (leg: { bottom: number; top: number }, i: number) => {
    const t = i / BAYS;
    return {
      x: leg.top + (leg.bottom - leg.top) * t,
      y: MAST_TOP + (VB.h - MAST_TOP) * t,
    };
  };

  const parts: React.ReactElement[] = [];
  for (let i = 0; i < BAYS; i++) {
    const l0 = at(LEG_L, i);
    const l1 = at(LEG_L, i + 1);
    const r0 = at(LEG_R, i);
    const r1 = at(LEG_R, i + 1);
    // horizontal rung, then the two diagonals that make the bay
    parts.push(
      <path
        key={i}
        d={`M${l0.x} ${l0.y}H${r0.x}M${l0.x} ${l0.y}L${r1.x} ${r1.y}M${r0.x} ${r0.y}L${l1.x} ${l1.y}`}
      />
    );
  }
  return parts;
}

export function FloodlightTower({
  tone = "warm",
  className = "",
}: {
  tone?: "warm" | "cool";
  className?: string;
}) {
  const { lamp, core } = TONE[tone];
  // Namespaced per tone: two instances sharing an id would make the second
  // tower's head reference the first one's filter.
  const bloomId = `rtpl-flood-bloom-${tone}`;
  const coreId = `rtpl-flood-core-${tone}`;

  // 4 x 3 grid. The corners are rounded hard (rx 9 on a 22-tall lamp) because
  // a soft shape blurs into a believable pool of light; a square one blurs
  // into a smudge.
  const lamps: React.ReactElement[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      lamps.push(
        <rect
          key={`${row}-${col}`}
          x={24 + col * 39}
          y={51 + row * 28}
          width={34}
          height={22}
          rx={9}
        />
      );
    }
  }

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className={className}
      preserveAspectRatio="xMidYMin meet"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={bloomId} x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id={coreId} x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Mast */}
      <g
        fill="none"
        stroke="var(--color-night-600)"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path
          d={`M${LEG_L.top} ${MAST_TOP}L${LEG_L.bottom} ${VB.h}`}
          strokeWidth="4"
        />
        <path
          d={`M${LEG_R.top} ${MAST_TOP}L${LEG_R.bottom} ${VB.h}`}
          strokeWidth="4"
        />
        {lattice()}
      </g>

      {/* The mast carries on up into the light instead of stopping under a
          fitting. Drawn outside the tilted group so it stays vertical. */}
      <path
        d={`M104 ${MAST_TOP}V106`}
        fill="none"
        stroke="var(--color-night-600)"
        strokeWidth="3.5"
      />

      {/* Head — light only, tilted down toward the middle of the page */}
      <g transform="rotate(-9 104 110)">
        <g fill={lamp} opacity="0.72" filter={`url(#${bloomId})`}>
          {lamps}
        </g>
        <g fill={core} opacity="0.9" filter={`url(#${coreId})`}>
          {lamps}
        </g>
      </g>
    </svg>
  );
}
