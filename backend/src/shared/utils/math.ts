/**
 * Computes percentage growth between two values.
 * Never stores percentages — always calculated.
 * Division by zero: both zero → 0; previous zero & current > 0 → 100.
 */
export function calculateGrowthPercent(current: number, previous: number): number {
  if (previous === 0) {
    if (current === 0) {
      return 0;
    }
    return 100;
  }

  return round2(((current - previous) / previous) * 100);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Safe division — returns 0 when denominator is 0.
 */
export function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

/**
 * Converts counts into percentages that sum to exactly 100 (largest remainder method).
 * Returns an empty array when total is 0.
 */
export function toPercentageDistribution(
  items: Array<{ label: string; value: number }>,
): Array<{ label: string; value: number; percentage: number }> {
  const positive = items.filter((item) => item.value > 0);
  const total = positive.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return [];
  }

  const raw = positive.map((item) => {
    const exact = (item.value / total) * 100;
    const floored = Math.floor(exact);
    return {
      label: item.label,
      value: item.value,
      percentage: floored,
      remainder: exact - floored,
    };
  });

  let remaining = 100 - raw.reduce((sum, item) => sum + item.percentage, 0);
  raw
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((item) => {
      if (remaining <= 0) {
        return;
      }
      item.percentage += 1;
      remaining -= 1;
    });

  return raw.map(({ label, value, percentage }) => ({ label, value, percentage }));
}
