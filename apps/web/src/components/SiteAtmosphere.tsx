"use client";

import { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";

// Tiny inline SVG feTurbulence noise, tiled — the classic cheap technique
// for giving a flat dark UI a "designed" material feel instead of looking
// like a solid color fill. Kept at very low opacity with mix-blend-overlay
// so it never actually reads as visible grain, just texture.
const NOISE_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  );

/**
 * A single cohesive backdrop layer for the whole homepage: a slow-drifting
 * aurora (three blurred blobs, continuous idle motion — same language as
 * the hero's), a soft radial glow that trails the cursor, and a faint
 * noise texture. All transform/opacity, all pointer-events-none, all
 * automatically frozen for prefers-reduced-motion via MotionProvider's
 * global reducedMotion="user" config — the cursor spotlight simply stops
 * updating (harmless, not broken) since it's driven by the same motion
 * value system.
 */
export function PageAtmosphere() {
  const cursorX = useMotionValue(-400);
  const cursorY = useMotionValue(-400);
  const smoothX = useSpring(cursorX, { stiffness: 60, damping: 20, mass: 0.5 });
  const smoothY = useSpring(cursorY, { stiffness: 60, damping: 20, mass: 0.5 });
  const spotlightBackground = useMotionTemplate`radial-gradient(560px circle at ${smoothX}px ${smoothY}px, rgba(124,58,237,0.08), transparent 75%)`;

  useEffect(() => {
    // Pointer-only (matches Magnetic/Testimonials tilt precedent) — never
    // fires on touch, so this is simply inert there, not broken.
    function handleMove(event: MouseEvent) {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [cursorX, cursorY]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 30, -20, 0], y: [0, -14, 10, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 start-1/4 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -24, 18, 0], y: [0, 16, -12, 0], scale: [1, 0.94, 1.06, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/3 end-0 h-80 w-80 rounded-full bg-brand-secondary/10 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 18, -18, 0], y: [0, -10, 14, 0], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-0 start-1/3 h-72 w-72 rounded-full bg-brand-accent/5 blur-3xl"
      />

      <motion.div className="absolute inset-0" style={{ background: spotlightBackground }} />

      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_DATA_URI}")` }}
      />
    </div>
  );
}
