import { BallMark } from "./CricketBall";

/**
 * The scrolling band between the hero and the call to action — the boundary
 * board running round a ground, in effect.
 *
 * The phrase list is rendered twice into one track that travels exactly half
 * its own width, so the loop closes on itself with no visible seam. The
 * second copy is hidden from assistive tech, and the whole band pauses on
 * hover for anyone trying to actually read it.
 */
export function Ticker({ items }: { items: readonly string[] }) {
  const run = (hidden: boolean) =>
    items.map((item, i) => (
      <span
        key={`${hidden ? "b" : "a"}-${item}-${i}`}
        className="ticker-item"
        aria-hidden={hidden || undefined}
      >
        {item}
        <BallMark className="h-[9px] w-[9px] shrink-0 opacity-80" />
      </span>
    ));

  return (
    <div className="ticker">
      <div className="ticker-track">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
