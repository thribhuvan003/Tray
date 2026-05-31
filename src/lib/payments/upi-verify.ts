/** Final amount the student actually pays = menu total + uniqueness tag. */
export function finalAmountPaise(totalPaise: number, verifyPaise: number | null): number {
  return totalPaise + (verifyPaise ?? 0);
}

/**
 * Pick a 1..99 paise tag so that `basePaise + tag` is unique among the tenant's
 * currently-pending final amounts. Returns 0 if every tag for this base is taken
 * (caller routes that order to the manual safety net).
 *
 * @param basePaise        the order's menu total in paise
 * @param takenFinalAmounts final amounts (total+tag) of the tenant's pending orders
 */
export function pickVerifyPaise(basePaise: number, takenFinalAmounts: number[]): number {
  const taken = new Set(takenFinalAmounts);
  // Randomised start so concurrent placements are unlikely to probe in lockstep.
  const start = 1 + Math.floor(Math.random() * 99);
  for (let i = 0; i < 99; i++) {
    const tag = ((start - 1 + i) % 99) + 1; // 1..99
    if (!taken.has(basePaise + tag)) return tag;
  }
  return 0;
}
