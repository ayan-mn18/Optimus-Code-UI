/**
 * Chart palette.
 *
 * Every mark below encodes magnitude, so the whole system runs on ONE hue —
 * a violet ordinal ramp validated against the card surface (#131318): monotone
 * lightness, ≥0.06 ΔL between steps, and the step nearest the surface clears
 * 2:1. Day state (a red day) is drawn as a ring rather than a fill, so status
 * lives on a separate visual channel and never competes with magnitude — which
 * also keeps red/green day state legible for red-green colorblind readers.
 */
export const RAMP = ['#c4b5fd', '#a78bfa', '#8b7bff', '#7c5cff', '#5b46c4'] as const;

/** Difficulty reads as an ordinal scale: lighter = easier. */
export const DIFFICULTY_STEP = { Easy: '#c4b5fd', Medium: '#8b7bff', Hard: '#5b46c4' } as const;

export const INK = {
  primary: '#f2f2f7',
  secondary: '#a1a1b0',
  muted: '#6e6e80',
  grid: '#24242e',
  surface: '#131318',
} as const;

export const STATUS = { complete: '#34d399', missed: '#f4696b' } as const;

/** Maps a solve count onto the ramp; 0 stays near the surface. */
export function heatStep(count: number, target: number) {
  if (count <= 0) return '#191922';
  const ratio = count / Math.max(target, 1);
  if (ratio < 0.34) return RAMP[0];
  if (ratio < 0.67) return RAMP[1];
  if (ratio < 1) return RAMP[2];
  if (ratio < 1.5) return RAMP[3];
  return RAMP[4];
}
