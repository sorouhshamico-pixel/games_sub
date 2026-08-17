/**
 * Single source of truth for every animation value in the storefront —
 * durations, easing, spring physics. Nothing outside this file should hard-code
 * a duration or easing curve; import from here so the whole store's motion
 * feels like one system instead of accumulating drift per-component.
 *
 * Durations are in seconds (motion/react's native unit), not milliseconds.
 */

export const duration = {
  fast: 0.16,
  normal: 0.24,
  medium: 0.36,
  slow: 0.55,
  hero: 0.8,
} as const;

/** Primary easing curve — used for nearly everything that isn't a spring. */
export const easing = [0.22, 1, 0.36, 1] as const;

/** For interactive, physically-driven motion (press/drag/hover feedback) rather than fixed-duration transitions. */
export const spring = {
  stiffness: 320,
  damping: 26,
  mass: 0.8,
} as const;

/** Standard tween transition using the house easing curve. */
export function tween(d: number = duration.normal) {
  return { duration: d, ease: easing };
}

/** Standard spring transition using the house spring physics. */
export const springTransition = { type: "spring" as const, ...spring };

/**
 * Page transition timings — deliberately distinct from the named duration
 * scale above (320ms/180ms), not reused from it: exits are snappier than
 * entries so the route change reads as "leaving quickly, arriving smoothly"
 * rather than symmetric.
 */
export const pageTransition = {
  enter: { duration: 0.32, ease: easing },
  exit: { duration: 0.18, ease: easing },
};

/** Shared fade+rise+blur "reveal" motion values, used by <Reveal> and page transitions alike. */
export const reveal = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

/** Default stagger gap between siblings in <StaggerContainer>. */
export const staggerGap = 0.06;
