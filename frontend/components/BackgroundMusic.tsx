"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SRC = "/music/song.mp3";

/** Background, not foreground — loud enough to notice, quiet enough to read over. */
const VOLUME = 0.35;

/** Remembers a deliberate silence, so turning it off survives a reload. */
const STORAGE_KEY = "rtpl:music-muted";

/**
 * Looping match-day music, mounted in the root layout so it carries across the
 * client-side hop between the landing page and the registration form instead
 * of restarting.
 *
 * Every browser blocks audible autoplay until the visitor has interacted with
 * the page, so the play attempt on mount is expected to fail on a cold visit.
 * When it does we wait for the first click, tap or keypress anywhere and start
 * from there — which is why the button below reads as off until then rather
 * than claiming to be playing.
 *
 * The button is not decoration: sound that starts on its own has to be
 * stoppable (WCAG 2.2, 1.4.2), and `preload="none"` keeps the 4.5 MB off the
 * wire entirely for anyone who never lets it play.
 */
export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  /** Resolves false when the browser refuses — the caller decides what next. */
  const start = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    audio.volume = VOLUME;
    try {
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let muted = false;
    try {
      muted = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Private mode, or storage blocked outright. Treat as no preference.
    }
    if (muted) return;

    let cancelled = false;
    const events = ["pointerdown", "keydown", "touchstart"] as const;

    const stopWaiting = () => {
      for (const event of events) {
        document.removeEventListener(event, onGesture);
      }
    };

    const onGesture = () => {
      // Whichever event fires first wins; drop the rest so a tap that also
      // produces a pointerdown does not queue a second play().
      stopWaiting();
      void start().then((ok) => {
        if (ok && !cancelled) setPlaying(true);
      });
    };

    void start().then((ok) => {
      if (cancelled) return;
      if (ok) {
        setPlaying(true);
        return;
      }
      // Autoplay refused — the visitor's first gesture is our opening.
      for (const event of events) {
        document.addEventListener(event, onGesture, { once: true });
      }
    });

    return () => {
      cancelled = true;
      stopWaiting();
    };
  }, [start]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      return;
    }

    if (await start()) {
      setPlaying(true);
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  };

  return (
    <>
      <audio ref={audioRef} src={SRC} loop preload="none" />

      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Turn the music off" : "Turn the music on"}
        title={playing ? "Turn the music off" : "Turn the music on"}
        className="music-toggle"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" />
            <path
              className="music-toggle__wave"
              d="M15.4 9.1a4.2 4.2 0 0 1 0 5.8M17.9 6.4a7.8 7.8 0 0 1 0 11.2"
              fill="none"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" />
            <path
              className="music-toggle__wave"
              d="m16 9.5 5 5m0-5-5 5"
              fill="none"
            />
          </svg>
        )}
      </button>
    </>
  );
}
