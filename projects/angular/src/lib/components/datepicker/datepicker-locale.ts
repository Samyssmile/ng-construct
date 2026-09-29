/** Locale used when none is given; reproduces the datepicker's original English names. */
export const AF_DATEPICKER_DEFAULT_LOCALE = 'en-US';

/** Locale-dependent names and formats a calendar renders, resolved once per locale. */
export interface AfCalendarNames {
  /** The locale these names were resolved for (after fallback). */
  locale: string;
  /** Full month names, January first (header, month view, `MMMM` token). */
  months: string[];
  /** Abbreviated month names, January first (month grid, `MMM` token). */
  monthsShort: string[];
  /** Two-letter weekday column labels, Monday first. */
  weekdays: string[];
  /** Full weekday names, Monday first (column header accessible names). */
  weekdaysLong: string[];
  /** Month and year as a title, e.g. "September 2026" / "2026年9月". */
  formatMonthYear(date: Date): string;
  /** Full date as an accessible name, e.g. "September 15, 2026" / "15. September 2026". */
  formatFullDate(date: Date): string;
}

/** 2024-01-01 is a Monday: the anchor for Monday-first weekday names. */
const FIRST_MONDAY = new Date(2024, 0, 1);

/**
 * Resolves the calendar names for a BCP-47 `locale` via `Intl.DateTimeFormat` (SSR-safe: no
 * DOM). A missing or invalid tag (e.g. `en_GB`, on which `Intl` throws) falls back to
 * {@link AF_DATEPICKER_DEFAULT_LOCALE}.
 */
export function resolveCalendarNames(locale?: string | null): AfCalendarNames {
  try {
    return buildCalendarNames(locale || AF_DATEPICKER_DEFAULT_LOCALE);
  } catch {
    return buildCalendarNames(AF_DATEPICKER_DEFAULT_LOCALE);
  }
}

function buildCalendarNames(locale: string): AfCalendarNames {
  const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options);
  const monthLong = format({ month: 'long' });
  const monthShort = format({ month: 'short' });
  const weekdayShort = format({ weekday: 'short' });
  const weekdayLong = format({ weekday: 'long' });
  const monthYear = format({ month: 'long', year: 'numeric' });
  const fullDate = format({ dateStyle: 'long' });

  const monthDates = Array.from({ length: 12 }, (_, month) => new Date(2024, month, 1));
  const weekDates = Array.from(
    { length: 7 },
    (_, day) => new Date(FIRST_MONDAY.getFullYear(), FIRST_MONDAY.getMonth(), 1 + day),
  );

  return {
    locale: monthLong.resolvedOptions().locale,
    months: monthDates.map((date) => monthLong.format(date)),
    monthsShort: monthDates.map((date) => monthShort.format(date)),
    weekdays: weekDates.map((date) => twoLetters(weekdayShort.format(date))),
    weekdaysLong: weekDates.map((date) => weekdayLong.format(date)),
    formatMonthYear: (date) => monthYear.format(date),
    formatFullDate: (date) => fullDate.format(date),
  };
}

/** "Mon" → "Mo", "Di." → "Di", "月" → "月": at most two characters, trailing dot dropped. */
function twoLetters(name: string): string {
  return Array.from(name.replace(/\.$/, '')).slice(0, 2).join('');
}
