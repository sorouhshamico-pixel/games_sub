"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

const OFFER_WINDOW_MS = 6 * 60 * 60 * 1000;

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    h: Math.floor(totalSeconds / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

/** Same fixed-window countdown as the homepage's LimitedOffers strip —
 * starts counting down from a fresh window on mount (not from a stored
 * deadline), so it never causes a server/client hydration mismatch. */
export function OffersCountdown() {
  const locale = useLocale();
  const [msLeft, setMsLeft] = useState(OFFER_WINDOW_MS);

  useEffect(() => {
    const target = Date.now() + OFFER_WINDOW_MS;
    const tick = () => setMsLeft(Math.max(0, target - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const { h, m, s } = formatDuration(msLeft);

  return (
    <div
      role="timer"
      aria-live="off"
      className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 font-mono text-sm tabular-nums text-[var(--color-text-primary)] sm:text-base"
    >
      <span className="text-xs font-sans font-medium text-[var(--color-text-muted)]">
        {locale === "ar" ? "ينتهي خلال" : "Ends in"}
      </span>
      <span>{String(h).padStart(2, "0")}</span>:<span>{String(m).padStart(2, "0")}</span>:<span>{String(s).padStart(2, "0")}</span>
    </div>
  );
}
