/**
 * Top-down plan of the main ground: mown outfield, boundary rope, thirty-yard
 * circle, the square with its creases, and the four floodlight towers. Drawn
 * with the design tokens so it stays in step with the palette — greens from
 * `--color-pitch`, and a straw square, the way a prepared strip actually looks
 * from the stand. Not on the landing page at the moment: it was drawn for the
 * venue section and is waiting on wherever that goes next.
 */
export function GroundPlan({ className = "" }: { className?: string }) {
  const label = {
    fontSize: 8.5,
    letterSpacing: "0.14em",
    fill: "var(--color-pitch-700)",
    fillOpacity: 0.75,
    textTransform: "uppercase" as const,
  };

  return (
    <svg
      viewBox="0 0 400 250"
      className={className}
      role="img"
      aria-label="Plan of the main ground: boundary, thirty-yard circle, pitch and four floodlight towers"
    >
      <defs>
        {/* The roller stripes are drawn as full-width bands and then cut to
            the outfield, so the mowing follows the curve of the boundary. */}
        <clipPath id="rtpl-outfield">
          <ellipse cx="200" cy="125" rx="182" ry="112" />
        </clipPath>
      </defs>

      {/* outfield */}
      <ellipse
        cx="200"
        cy="125"
        rx="182"
        ry="112"
        fill="color-mix(in srgb, var(--color-pitch) 26%, var(--color-paper))"
      />
      <g clipPath="url(#rtpl-outfield)">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect
            key={i}
            x={18 + i * 46}
            y="13"
            width="23"
            height="224"
            fill="var(--color-pitch)"
            fillOpacity="0.1"
          />
        ))}
      </g>
      {/* boundary rope */}
      <ellipse
        cx="200"
        cy="125"
        rx="182"
        ry="112"
        fill="none"
        stroke="var(--color-pitch-700)"
        strokeWidth="2"
      />

      {/* thirty-yard circle */}
      <ellipse
        cx="200"
        cy="125"
        rx="104"
        ry="64"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="2"
        strokeDasharray="6 7"
        opacity="0.9"
      />

      {/* the square — straw, not green */}
      <rect
        x="186"
        y="83"
        width="28"
        height="84"
        fill="color-mix(in srgb, var(--color-gold) 34%, var(--color-paper))"
        stroke="var(--color-gold-700)"
        strokeWidth="1.5"
      />
      {/* creases */}
      <line x1="182" y1="93" x2="218" y2="93" stroke="var(--color-paper)" strokeWidth="1.5" />
      <line x1="182" y1="157" x2="218" y2="157" stroke="var(--color-paper)" strokeWidth="1.5" />
      {/* stumps */}
      <circle cx="200" cy="93" r="2.4" fill="var(--color-leather)" />
      <circle cx="200" cy="157" r="2.4" fill="var(--color-leather)" />

      {/* floodlight towers, breathing out of step with one another */}
      {[
        [56, 44],
        [344, 44],
        [56, 206],
        [344, 206],
      ].map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <circle
            cx={x}
            cy={y}
            r="13"
            fill="var(--color-gold)"
            fillOpacity="0.28"
            className="floodlight"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
          <rect
            x={x - 5}
            y={y - 5}
            width="10"
            height="10"
            fill="var(--color-paper)"
            stroke="var(--color-gold-700)"
            strokeWidth="1.5"
          />
          <circle
            cx={x}
            cy={y}
            r="1.8"
            fill="var(--color-gold-700)"
            className="floodlight"
            style={{ animationDelay: `${i * 0.45}s` }}
          />
        </g>
      ))}

      <text x="200" y="128" textAnchor="middle" style={label}>
        22 YD
      </text>
      <text x="200" y="207" textAnchor="middle" style={label}>
        30 YD CIRCLE
      </text>
      <text x="200" y="245" textAnchor="middle" style={label}>
        BOUNDARY 68 M · FLOODLIT
      </text>
    </svg>
  );
}
