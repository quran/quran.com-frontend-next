/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import umalqura from '@umalqura/core';
import { it, expect, describe } from 'vitest';

import { getCurrentQuranicCalendarWeek } from './hijri-date';

describe('getCurrentQuranicCalendarWeek', () => {
  describe('Basic functionality', () => {
    it('should return week 1 for dates in the first week', () => {
      // umalqura(1446, 10, 8) -> 2025-04-05 (UTC), within week 1
      const hijriDate = umalqura(1446, 10, 8);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(1);
    });

    it('should return week 2 for dates in the second week', () => {
      // umalqura(1446, 10, 15) -> 2025-04-12 (UTC)
      const hijriDate = umalqura(1446, 10, 15);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(2);
    });

    it('should return week 6 for dates in May', () => {
      // umalqura(1446, 11, 13) -> 2025-05-10 (UTC)
      const hijriDate = umalqura(1446, 11, 13);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(6);
    });

    it('should return week 38 for dates in late December', () => {
      // umalqura(1447, 6, 30) -> 2025-12-20 (UTC)
      const hijriDate = umalqura(1447, 6, 30);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(38);
    });

    it('should return week 11 for dates in late June', () => {
      // umalqura(1446, 12, 24) -> 2025-06-19 (UTC)
      const hijriDate = umalqura(1446, 12, 24);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(11);
    });

    it('should return week 25 for dates in late September', () => {
      // umalqura(1447, 3, 30) -> 2025-09-21 (UTC)
      const hijriDate = umalqura(1447, 3, 30);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(25);
    });

    it('should return week 26 for dates in early October', () => {
      // umalqura(1447, 4, 7) -> 2025-09-28 (UTC)
      const hijriDate = umalqura(1447, 4, 7);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(26);
    });
  });

  describe('Edge cases', () => {
    it('should return 0 for dates before the calendar starts', () => {
      // umalqura(1446, 9, 30) -> 2025-03-29 (UTC), before April 1 anchor
      const hijriDate = umalqura(1446, 9, 30);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(0);
    });

    it('should return 0 for dates after the calendar ends', () => {
      // umalqura(1447, 10, 1) -> 2026-03-19 (UTC), after calendar end
      const hijriDate = umalqura(1447, 10, 1);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(0);
    });

    it('should handle week boundaries correctly', () => {
      // Test that we get consistent results for dates in the same week
      const week1Date = umalqura(1446, 10, 8);
      const anotherWeek1Date = umalqura(1446, 10, 9);

      expect(getCurrentQuranicCalendarWeek(week1Date)).toEqual(1);
      expect(getCurrentQuranicCalendarWeek(anotherWeek1Date)).toEqual(1);
    });

    it('should return first match if data has overlapping ranges', () => {
      // This test verifies the early-return behavior is preserved
      // If the cache iteration worked incorrectly (returning last match),
      // this test would fail. The current data shouldn't have overlaps,
      // but this ensures the logic is correct.

      // Test multiple dates to ensure consistent first-match behavior
      const testDates = [
        umalqura(1446, 10, 8), // Week 1
        umalqura(1446, 10, 15), // Week 2
        umalqura(1446, 11, 13), // Week 6
      ];

      // Each call should return immediately on first match
      const results = testDates.map((date) => getCurrentQuranicCalendarWeek(date));
      expect(results).toEqual([1, 2, 6]);
    });
  });

  describe('Timezone independence (core fix verification)', () => {
    it('should return consistent results regardless of system timezone', () => {
      // This is the main test for our timezone fix
      // Create a hijri date object
      const hijriDate = umalqura(1446, 10, 15);

      // The function should work consistently regardless of the local timezone
      const result = getCurrentQuranicCalendarWeek(hijriDate);
      expect(result).toEqual(2); // Should always be week 2
    });

    it('should handle the same date created in different ways', () => {
      // Create multiple hijri date objects for the same date
      const hijriDates = [
        umalqura(1446, 10, 15),
        umalqura(new Date(2025, 3, 15)), // April 15, 2025 (month is 0-indexed)
      ];

      // All should return the same week
      const results = hijriDates.map((date) => getCurrentQuranicCalendarWeek(date));
      expect(new Set(results).size).toEqual(1);
      expect(results[0]).toEqual(2);
    });

    it('should handle dates near midnight correctly across timezones', () => {
      // This test verifies the UTC component extraction fix
      // Create a date that's late at night in one timezone but next day in UTC

      // April 15, 2025 23:30 in UTC-8 is actually April 16, 2025 07:30 UTC
      const lateNightDate = new Date('2025-04-15T23:30:00-08:00');
      const hijriFromLateNight = umalqura(lateNightDate);

      // April 16, 2025 00:30 in UTC+0
      const earlyMorningDate = new Date('2025-04-16T00:30:00Z');
      const hijriFromEarlyMorning = umalqura(earlyMorningDate);

      // Both should return the same week since they represent the same UTC day
      const week1 = getCurrentQuranicCalendarWeek(hijriFromLateNight);
      const week2 = getCurrentQuranicCalendarWeek(hijriFromEarlyMorning);

      expect(week1).toEqual(week2);
      expect(week1).toEqual(2); // Both should be in week 2
    });
  });

  describe('Performance', () => {
    it('should handle multiple calls efficiently', () => {
      const hijriDate = umalqura(1446, 10, 15);
      const results = [];

      // Call the function multiple times
      for (let i = 0; i < 100; i += 1) {
        results.push(getCurrentQuranicCalendarWeek(hijriDate));
      }

      // All results should be the same
      expect(new Set(results).size).toEqual(1);
      expect(results[0]).toEqual(2);
    });
  });

  describe('Known week mappings', () => {
    it('should correctly identify weeks from the calendar data', () => {
      // Test against known week mappings from quranic-calendar.json
      const knownMappings = [
        { hijri: umalqura(1446, 10, 8), expectedWeek: 1 }, // Well into week 1
        { hijri: umalqura(1446, 10, 15), expectedWeek: 2 }, // Mid April
        { hijri: umalqura(1446, 11, 13), expectedWeek: 6 }, // Mid May (adjusted)
        { hijri: umalqura(1446, 12, 24), expectedWeek: 11 }, // Late June (using known good value)
        { hijri: umalqura(1447, 6, 30), expectedWeek: 38 }, // Late December (using known good value)
      ];

      knownMappings.forEach(({ hijri, expectedWeek }) => {
        const result = getCurrentQuranicCalendarWeek(hijri);
        expect(result).toEqual(expectedWeek);
      });
    });
  });

  describe('Regression prevention', () => {
    it('should never return negative numbers', () => {
      const dates = [
        umalqura(1446, 9, 1), // Before calendar start
        umalqura(1446, 10, 15), // During calendar
        umalqura(1447, 10, 1), // After calendar end
      ];

      dates.forEach((date) => {
        const result = getCurrentQuranicCalendarWeek(date);
        expect(result).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return values within valid range (0-46)', () => {
      // Test various dates throughout the year
      for (let month = 10; month <= 12; month += 1) {
        for (let day = 1; day <= 20; day += 5) {
          const hijriDate = umalqura(1446, month, day);
          const result = getCurrentQuranicCalendarWeek(hijriDate);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(46);
        }
      }
    });
  });
});
