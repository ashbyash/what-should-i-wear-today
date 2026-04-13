import { describe, it, expect } from 'vitest';
import {
  getKSTDate,
  formatKSTDate,
  formatKSTTime,
  getKSTHour,
  getKSTMinutes,
  getKSTYesterday,
} from '../kst-time';

// Helper: kst-time functions expect a Date that already has KST offset baked in.
// They use getUTC* methods on the offset date. So we create: new Date(utcMs + 9h).
function makeKSTDate(isoUtc: string): Date {
  const utc = new Date(isoUtc);
  return new Date(utc.getTime() + 9 * 60 * 60 * 1000);
}

describe('formatKSTDate', () => {
  it('formats UTC midnight as KST same-day date (09:00 KST)', () => {
    expect(formatKSTDate(makeKSTDate('2026-04-13T00:00:00Z'))).toBe('20260413');
  });

  it('formats UTC 15:00 as KST next-day date (00:00 KST)', () => {
    expect(formatKSTDate(makeKSTDate('2026-04-13T15:00:00Z'))).toBe('20260414');
  });

  it('pads single-digit month and day with zeros', () => {
    const result = formatKSTDate(makeKSTDate('2026-01-01T00:00:00Z'));
    expect(result).toBe('20260101');
  });
});

describe('formatKSTTime', () => {
  it('formats UTC midnight as KST 0900', () => {
    expect(formatKSTTime(makeKSTDate('2026-04-13T00:00:00Z'))).toBe('0900');
  });

  it('formats UTC 15:00 as KST 0000', () => {
    expect(formatKSTTime(makeKSTDate('2026-04-13T15:00:00Z'))).toBe('0000');
  });

  it('formats UTC 03:30 as KST 1230', () => {
    expect(formatKSTTime(makeKSTDate('2026-04-13T03:30:00Z'))).toBe('1230');
  });
});

describe('getKSTHour', () => {
  it('returns 9 for UTC midnight', () => {
    expect(getKSTHour(makeKSTDate('2026-04-13T00:00:00Z'))).toBe(9);
  });

  it('returns 0 for UTC 15:00', () => {
    expect(getKSTHour(makeKSTDate('2026-04-13T15:00:00Z'))).toBe(0);
  });
});

describe('getKSTMinutes', () => {
  it('returns correct minutes', () => {
    expect(getKSTMinutes(makeKSTDate('2026-04-13T03:30:00Z'))).toBe(30);
  });

  it('returns 0 for on-the-hour time', () => {
    expect(getKSTMinutes(makeKSTDate('2026-04-13T00:00:00Z'))).toBe(0);
  });
});

describe('getKSTYesterday', () => {
  it('returns a date one day before KST now', () => {
    const today = getKSTDate();
    const yesterday = getKSTYesterday();
    const diffMs = today.getTime() - yesterday.getTime();
    const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(1);
  });
});
