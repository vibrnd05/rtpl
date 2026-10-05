/** Flat cup-and-handles silhouette, sized for a badge or an inline label. */
export function TrophyIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M7 3h10v2h3a1 1 0 0 1 1 1c0 3.3-2.2 5.6-5 6.1a5.6 5.6 0 0 1-2.5 2.9V17H15a1 1 0 0 1 1 1v1H8v-1a1 1 0 0 1 1-1h1.5v-1.9A5.6 5.6 0 0 1 8 12.1C5.2 11.6 3 9.3 3 6a1 1 0 0 1 1-1h3V3Zm0 4H5.1c.3 1.7 1.6 3 3.4 3.4a7.6 7.6 0 0 1-.5-3.1V7Zm10 0v.3c0 1.1-.2 2.1-.5 3.1 1.8-.4 3.1-1.7 3.4-3.4H17Z"
      />
    </svg>
  );
}
