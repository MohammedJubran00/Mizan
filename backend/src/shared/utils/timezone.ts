export interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface PeriodBounds {
  /** Inclusive UTC start instant. */
  start: Date;
  /** Exclusive UTC end instant. */
  end: Date;
}

export interface WorkspacePeriods {
  today: PeriodBounds;
  yesterday: PeriodBounds;
  thisWeek: PeriodBounds;
  lastWeek: PeriodBounds;
  thisMonth: PeriodBounds;
  lastMonth: PeriodBounds;
  thisQuarter: PeriodBounds;
  lastQuarter: PeriodBounds;
  thisYear: PeriodBounds;
  lastYear: PeriodBounds;
  next24Hours: PeriodBounds;
  next3Days: PeriodBounds;
  next7Days: PeriodBounds;
  next30Days: PeriodBounds;
}

const DEFAULT_TIMEZONE = 'UTC';

/**
 * Resolves a valid IANA timezone, falling back to UTC when invalid.
 */
export function normalizeTimezone(timezone: string | null | undefined): string {
  const candidate = timezone?.trim() || DEFAULT_TIMEZONE;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: candidate });
    return candidate;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/**
 * Reads calendar/clock parts of an instant in a workspace timezone.
 */
export function getZonedParts(date: Date, timeZone: string): ZonedDateParts {
  const tz = normalizeTimezone(timeZone);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    return Number(value ?? 0);
  };

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
    second: read('second'),
  };
}

/**
 * Converts a local wall-clock datetime in `timeZone` to a UTC `Date`.
 */
export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  const tz = normalizeTimezone(timeZone);
  const desiredAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let instant = desiredAsUtc;

  for (let i = 0; i < 3; i += 1) {
    const parts = getZonedParts(new Date(instant), tz);
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );
    instant += desiredAsUtc - asUtc;
  }

  return new Date(instant);
}

function startOfDay(parts: ZonedDateParts, timeZone: string): Date {
  return zonedLocalToUtc(parts.year, parts.month, parts.day, 0, 0, 0, timeZone);
}

function addDays(parts: ZonedDateParts, days: number): ZonedDateParts {
  const utc = Date.UTC(parts.year, parts.month - 1, parts.day + days, 12, 0, 0);
  const d = new Date(utc);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: 0,
    minute: 0,
    second: 0,
  };
}

function startOfWeekMonday(parts: ZonedDateParts, timeZone: string): Date {
  const noonUtc = Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0);
  const dow = new Date(noonUtc).getUTCDay(); // 0 Sun .. 6 Sat
  const daysFromMonday = (dow + 6) % 7;
  const monday = addDays(parts, -daysFromMonday);
  return startOfDay(monday, timeZone);
}

function startOfMonth(year: number, month: number, timeZone: string): Date {
  return zonedLocalToUtc(year, month, 1, 0, 0, 0, timeZone);
}

function startOfQuarter(year: number, month: number, timeZone: string): Date {
  const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
  return startOfMonth(year, quarterStartMonth, timeZone);
}

function startOfYear(year: number, timeZone: string): Date {
  return zonedLocalToUtc(year, 1, 1, 0, 0, 0, timeZone);
}

/**
 * Builds all dashboard period windows in the workspace timezone.
 * Bounds are UTC instants; comparisons must use inclusive start / exclusive end.
 */
export function resolveWorkspacePeriods(
  now: Date,
  timeZone: string,
): WorkspacePeriods {
  const tz = normalizeTimezone(timeZone);
  const parts = getZonedParts(now, tz);

  const todayStart = startOfDay(parts, tz);
  const tomorrowStart = startOfDay(addDays(parts, 1), tz);
  const yesterdayStart = startOfDay(addDays(parts, -1), tz);

  const thisWeekStart = startOfWeekMonday(parts, tz);
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  // Recompute last week start in zone to avoid DST drift on the end bound
  const lastWeekParts = getZonedParts(lastWeekStart, tz);
  const lastWeekStartExact = startOfWeekMonday(lastWeekParts, tz);

  const thisMonthStart = startOfMonth(parts.year, parts.month, tz);
  const prevMonthYear = parts.month === 1 ? parts.year - 1 : parts.year;
  const prevMonth = parts.month === 1 ? 12 : parts.month - 1;
  const lastMonthStart = startOfMonth(prevMonthYear, prevMonth, tz);

  const thisQuarterStart = startOfQuarter(parts.year, parts.month, tz);
  const thisQuarterMonth = Math.floor((parts.month - 1) / 3) * 3 + 1;
  const lastQuarterMonth = thisQuarterMonth - 3;
  const lastQuarterYear = lastQuarterMonth < 1 ? parts.year - 1 : parts.year;
  const normalizedLastQuarterMonth = lastQuarterMonth < 1 ? lastQuarterMonth + 12 : lastQuarterMonth;
  const lastQuarterStart = startOfMonth(lastQuarterYear, normalizedLastQuarterMonth, tz);

  const thisYearStart = startOfYear(parts.year, tz);
  const lastYearStart = startOfYear(parts.year - 1, tz);
  const nextYearStart = startOfYear(parts.year + 1, tz);

  const nextMonth =
    parts.month === 12
      ? startOfMonth(parts.year + 1, 1, tz)
      : startOfMonth(parts.year, parts.month + 1, tz);

  const nextQuarterMonth = thisQuarterMonth + 3;
  const nextQuarterYear = nextQuarterMonth > 12 ? parts.year + 1 : parts.year;
  const normalizedNextQuarterMonth =
    nextQuarterMonth > 12 ? nextQuarterMonth - 12 : nextQuarterMonth;
  const nextQuarterStart = startOfMonth(nextQuarterYear, normalizedNextQuarterMonth, tz);

  const nextWeekStart = new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    today: { start: todayStart, end: tomorrowStart },
    yesterday: { start: yesterdayStart, end: todayStart },
    thisWeek: { start: thisWeekStart, end: nextWeekStart },
    lastWeek: { start: lastWeekStartExact, end: thisWeekStart },
    thisMonth: { start: thisMonthStart, end: nextMonth },
    lastMonth: { start: lastMonthStart, end: thisMonthStart },
    thisQuarter: { start: thisQuarterStart, end: nextQuarterStart },
    lastQuarter: { start: lastQuarterStart, end: thisQuarterStart },
    thisYear: { start: thisYearStart, end: nextYearStart },
    lastYear: { start: lastYearStart, end: thisYearStart },
    next24Hours: { start: now, end: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
    next3Days: { start: now, end: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) },
    next7Days: { start: now, end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    next30Days: { start: now, end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) },
  };
}

/**
 * Local hour (0–23) in the workspace timezone for greeting periods.
 */
export function getZonedHour(now: Date, timeZone: string): number {
  return getZonedParts(now, timeZone).hour;
}
