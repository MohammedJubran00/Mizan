import type { GreetingDto } from '../dto';

/**
 * Builds a time-of-day greeting from the authenticated user's name and server clock.
 * Never hardcodes the greeting text beyond the period template.
 */
export class GreetingService {
  build(fullName: string, now: Date = new Date()): GreetingDto {
    const firstName = extractFirstName(fullName);
    const period = resolvePeriod(now);
    const salutation = periodSalutation(period);

    return {
      message: `${salutation} ${firstName}`,
      period,
      firstName,
      serverTime: now.toISOString(),
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

function resolvePeriod(now: Date): GreetingDto['period'] {
  const hour = now.getHours();
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
