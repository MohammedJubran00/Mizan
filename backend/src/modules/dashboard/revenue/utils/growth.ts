import { calculateGrowthPercent } from '../../../../shared/utils/math';
import type { GrowthDirection } from '../dto/revenue-analytics.dto';

export function resolveGrowthDirection(
  current: number,
  previous: number,
): GrowthDirection {
  if (current > previous) {
    return 'INCREASE';
  }
  if (current < previous) {
    return 'DECREASE';
  }
  return 'NO_CHANGE';
}

export function buildGrowthMetric(current: number, previous: number) {
  return {
    currentValue: current,
    previousValue: previous,
    percentage: calculateGrowthPercent(current, previous),
    direction: resolveGrowthDirection(current, previous),
  };
}
