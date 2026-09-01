/**
 * A red leather match ball, shaded as a sphere: a fixed light source top-left,
 * a warm bounce light bottom-right picked up from the brand orange, a darkened
 * terminator at the rim, and the six-row seam slowly turning about the view
 * axis. Pure SVG — no 3D library, no bundle cost.
 */
export function CricketBall({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      role="img"
      aria-label="Cricket ball"
    >
      <defs>
        {/* Leather, lit from the top left */}
        <radialGradient id="rtpl-leather" cx="34%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#d2564a" />
          <stop offset="20%" stopColor="#b8362d" />
          <stop offset="48%" stopColor="#951a22" />
          <stop offset="74%" stopColor="#640e16" />
          <stop offset="100%" stopColor="#37070d" />
        </radialGradient>

        {/* Bounce light off the ground, tinted with the league orange */}
        <radialGradient id="rtpl-bounce" cx="74%" cy="84%" r="46%">
          <stop offset="0%" stopColor="#ff8a3d" stopOpacity="0.42" />
          <stop offset="60%" stopColor="#ff8a3d" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>

        {/* Rim darkening, so the sphere turns away at the edges */}
        <radialGradient id="rtpl-terminator" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="68%" stopColor="#000000" stopOpacity="0" />
          <stop offset="93%" stopColor="#000000" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.62" />
        </radialGradient>

        {/* Specular highlight on the polished side */}
        <radialGradient id="rtpl-gloss" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="110" cy="110" r="96" fill="url(#rtpl-leather)" />
      <circle cx="110" cy="110" r="96" fill="url(#rtpl-bounce)" />

      {/* Seam — tilted, then turned by the animation on the inner group */}
      <g transform="rotate(-16 110 110)">
        <g className="ball-seam">
          {/* the recessed channel the stitches sit in */}
          <ellipse
            cx="110"
            cy="110"
            rx="30"
            ry="92"
            fill="none"
            stroke="#2e0509"
            strokeWidth="14"
            opacity="0.7"
          />
          {/* two rows of cross-stitching */}
          <ellipse
            cx="110"
            cy="110"
            rx="25"
            ry="92"
            fill="none"
            stroke="#efe6d5"
            strokeWidth="5"
            strokeDasharray="4 13"
            strokeLinecap="round"
            opacity="0.88"
          />
          <ellipse
            cx="110"
            cy="110"
            rx="35"
            ry="92"
            fill="none"
            stroke="#efe6d5"
            strokeWidth="5"
            strokeDasharray="4 13"
            strokeDashoffset="8"
            strokeLinecap="round"
            opacity="0.78"
          />
        </g>
      </g>

      <circle cx="110" cy="110" r="96" fill="url(#rtpl-terminator)" />

      <ellipse
        cx="74"
        cy="64"
        rx="34"
        ry="24"
        fill="url(#rtpl-gloss)"
        transform="rotate(-32 74 64)"
      />
    </svg>
  );
}

/**
 * Flat-colour miniature for the wordmark — deliberately no gradients, so it
 * stays legible at 13px and cannot collide with the full ball's gradient ids.
 */
export function BallMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="11" fill="var(--color-leather)" />
      <path
        d="M12 1a11 11 0 0 0 0 22"
        fill="none"
        stroke="#efe6d5"
        strokeWidth="2.4"
        strokeDasharray="1.6 3.2"
        strokeLinecap="round"
        transform="rotate(-18 12 12)"
      />
    </svg>
  );
}
