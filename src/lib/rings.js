/** Fraction of a goal reached, always a finite number from 0 to 1 (never NaN or above 100%). */
export function ringFraction(value, goal) {
  const v = Number(value)
  const g = Number(goal)
  if (!Number.isFinite(v) || !Number.isFinite(g) || g <= 0 || v <= 0) return 0
  return Math.min(1, v / g)
}

/** Whole-number percent for ring labels: 0–100. */
export function ringPercent(value, goal) {
  return Math.round(ringFraction(value, goal) * 100)
}
