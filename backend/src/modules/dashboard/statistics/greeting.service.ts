import type { GreetingDto } from '../dto';
import { getZonedHour, normalizeTimezone } from '../../../shared/utils/timezone';

/**
 * Builds a time-of-day greeting from the authenticated user's name
 * and the workspace timezone clock — never hardcoded names or periods.
 */
export class GreetingService {
  build(
    fullName: string,
    now: Date = new Date(),
    timezone = 'UTC',
  ): GreetingDto {
    const tz = normalizeTimezone(timezone);
    const firstName = extractFirstName(fullName);
    const period = resolvePeriod(getZonedHour(now, tz));
    const salutation = periodSalutation(period);

    return {
      message: `${salutation} ${firstName}`,
      period,
      firstName,
      serverTime: now.toISOString(),
      timezone: tz,
    };
  }
}

function extractFirstName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return 'there';
  }
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function resolvePeriod(hour: number): GreetingDto['period'] {
  if (hour < 12) {
    return 'morning';
  }
  if (hour < 17) {
    return 'afternoon';
  }
  return 'evening';
}

function periodSalutation(period: GreetingDto['period']): string {
  switch (period) {
    case 'morning':
      return 'Good Morning';
    case 'afternoon':
      return 'Good Afternoon';
    case 'evening':
      return 'Good Evening';
  }
}
