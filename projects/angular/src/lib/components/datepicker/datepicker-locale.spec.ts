import { AF_DATEPICKER_DEFAULT_LOCALE, resolveCalendarNames } from './datepicker-locale';

describe('resolveCalendarNames', () => {
  // The tables the datepicker hard-coded up to 0.12.1: en-US must reproduce them exactly.
  const LEGACY_MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const LEGACY_MONTHS_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const LEGACY_WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const LEGACY_WEEKDAYS_LONG = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  it('reproduces the original English names when no locale is given', () => {
    for (const names of [
      resolveCalendarNames(),
      resolveCalendarNames(AF_DATEPICKER_DEFAULT_LOCALE),
    ]) {
      expect(names.months).toEqual(LEGACY_MONTHS);
      expect(names.monthsShort).toEqual(LEGACY_MONTHS_SHORT);
      expect(names.weekdays).toEqual(LEGACY_WEEKDAYS);
      expect(names.weekdaysLong).toEqual(LEGACY_WEEKDAYS_LONG);
      expect(names.formatMonthYear(new Date(2026, 8, 1))).toBe('September 2026');
    }
  });

  it('formats the accessible full date in the locale order', () => {
    expect(resolveCalendarNames().formatFullDate(new Date(2026, 8, 15))).toBe('September 15, 2026');
    expect(resolveCalendarNames('de-DE').formatFullDate(new Date(2026, 8, 15))).toBe(
      '15. September 2026',
    );
  });

  it('resolves German names, Monday first, with two-letter weekdays', () => {
    const names = resolveCalendarNames('de-DE');
    expect(names.months[2]).toBe('März');
    expect(names.weekdays).toEqual(['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']);
    expect(names.weekdaysLong[0]).toBe('Montag');
    expect(names.locale).toBe('de-DE');
  });

  it('orders month and year the way the locale does', () => {
    expect(resolveCalendarNames('ja-JP').formatMonthYear(new Date(2026, 8, 1))).toBe('2026年9月');
  });

  it('falls back to en-US for an invalid tag instead of throwing', () => {
    const names = resolveCalendarNames('en_GB');
    expect(names.locale).toBe('en-US');
    expect(names.monthsShort).toEqual(LEGACY_MONTHS_SHORT);
  });
});
