"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * A minimal toast stack: `toast("…")` from any client component, one
 * `<Toaster />` in the root layout. No dependency — the site only needs a line
 * of text, a tone and a dismiss button.
 */

export type ToastTone = "error" | "success" | "info";
type Toast = { id: number; message: string; tone: ToastTone };

/** Older toasts drop off so a burst never covers the form. */
const MAX_VISIBLE = 3;
const DURATION_MS = 6000;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function toast(message: string, tone: ToastTone = "error") {
  if (!message) return;
  // The same line twice (a double tap on submit) shows once, freshly timed.
  toasts = toasts.filter((t) => t.message !== message);
  toasts = [...toasts, { id: nextId++, message, tone }].slice(-MAX_VISIBLE);
  emit();
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => toasts;
const EMPTY: Toast[] = [];
const getServerSnapshot = () => EMPTY;

const BAR: Record<ToastTone, string> = {
  error: "bg-accent",
  success: "bg-[#3fb27f]",
  info: "bg-stone",
};

function ToastItem({ item }: { item: Toast }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(item.id), DURATION_MS);
    return () => clearTimeout(timer);
  }, [item.id]);

  return (
    <div
      role={item.tone === "error" ? "alert" : "status"}
      className="toast-in pointer-events-auto flex w-full items-start gap-3 border border-divider bg-surface py-3.5 pl-4 pr-2 shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
    >
      <span aria-hidden="true" className={`mt-1.5 h-2.5 w-2.5 shrink-0 ${BAR[item.tone]}`} />
      <p className="m-0 flex-1 text-[14px] leading-normal text-ink">{item.message}</p>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss"
        className="-my-1 shrink-0 cursor-pointer px-2 py-1 text-lg leading-none text-ink/60 hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}

export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      aria-live="assertive"
      // Top, not bottom: the music toggle owns the bottom-right corner.
      className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col gap-2.5 sm:inset-x-auto sm:right-6 sm:top-6 sm:w-[380px]"
    >
      {items.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  );
}
