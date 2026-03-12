/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import umalqura from '@umalqura/core';
import { it, expect, describe } from 'vitest';

import { getCurrentQuranicCalendarWeek } from './hijri-date';

describe('getCurrentQuranicCalendarWeek', () => {
  describe('Basic functionality', () => {
    it('starts week 1 on Friday, March 20, 2026 and rolls over on the next Friday', () => {
      const firstFriday = umalqura(new Date(2026, 2, 20));
      const lastDayOfWeek1 = umalqura(new Date(2026, 2, 26));
      const secondFriday = umalqura(new Date(2026, 2, 27));

      expect(getCurrentQuranicCalendarWeek(firstFriday)).toEqual(1);
      expect(getCurrentQuranicCalendarWeek(lastDayOfWeek1)).toEqual(1);
      expect(getCurrentQuranicCalendarWeek(secondFriday)).toEqual(2);
    });

    it('should return week 1 for dates in the first week', () => {
      // umalqura(1447, 10, 3) -> 2026-03-22 (UTC), within week 1
      const hijriDate = umalqura(1447, 10, 3);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(1);
    });

    it('should return week 2 for dates in the second week', () => {
      // umalqura(1447, 10, 10) -> 2026-03-29 (UTC)
      const hijriDate = umalqura(1447, 10, 10);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(2);
    });

    it('should return week 6 for dates in late April', () => {
      // umalqura(1447, 11, 13) -> 2026-04-30 (UTC)
      const hijriDate = umalqura(1447, 11, 13);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(6);
    });

    it('should return week 38 for dates in early December', () => {
      // umalqura(1448, 6, 26) -> 2026-12-06 (UTC)
      const hijriDate = umalqura(1448, 6, 26);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(38);
    });

    it('should return week 12 for dates in June', () => {
      // umalqura(1447, 12, 24) -> 2026-06-10 (UTC)
      const hijriDate = umalqura(1447, 12, 24);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(12);
    });

    it('should return week 25 for dates in early September', () => {
      // umalqura(1448, 3, 24) -> 2026-09-06 (UTC)
      const hijriDate = umalqura(1448, 3, 24);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(25);
    });

    it('should return week 26 for dates in mid September', () => {
      // umalqura(1448, 4, 3) -> 2026-09-15 (UTC)
      const hijriDate = umalqura(1448, 4, 3);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(26);
    });
  });

  describe('Edge cases', () => {
    it('should return 1 for dates before the calendar starts', () => {
      // umalqura(1447, 9, 29) -> 2026-03-18 (UTC), before 2026-03-20 anchor
      const hijriDate = umalqura(1447, 9, 29);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(1);
    });

    it('should return 46 for dates after the calendar ends', () => {
      // umalqura(1448, 9, 1) -> 2027-02-08 (UTC), after 2027-02-05 end
      const hijriDate = umalqura(1448, 9, 1);
      // TODO: reset it back to 0
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(46);
    });

    it('should handle week boundaries correctly', () => {
      const week1Date = umalqura(1447, 10, 1);
      const anotherWeek1Date = umalqura(1447, 10, 2);

      expect(getCurrentQuranicCalendarWeek(week1Date)).toEqual(1);
      expect(getCurrentQuranicCalendarWeek(anotherWeek1Date)).toEqual(1);
    });

    it('should return first match if data has overlapping ranges', () => {
      const testDates = [
        umalqura(1447, 10, 3), // Week 1
        umalqura(1447, 10, 10), // Week 2
        umalqura(1447, 11, 13), // Week 6
      ];

      const results = testDates.map((date) => getCurrentQuranicCalendarWeek(date));
      expect(results).toEqual([1, 2, 6]);
    });
  });

  describe('Timezone independence (core fix verification)', () => {
    it('should return consistent results regardless of system timezone', () => {
      const hijriDate = umalqura(1447, 10, 10);
      const result = getCurrentQuranicCalendarWeek(hijriDate);
      expect(result).toEqual(2);
    });

    it('should handle the same date created in different ways', () => {
      const hijriDates = [
        umalqura(1447, 10, 10),
        umalqura(new Date(2026, 2, 30)), // March 30, 2026 (month is 0-indexed)
      ];

      const results = hijriDates.map((date) => getCurrentQuranicCalendarWeek(date));
      expect(new Set(results).size).toEqual(1);
      expect(results[0]).toEqual(2);
    });

    it('should handle dates near midnight correctly across timezones', () => {
      const lateNightDate = new Date('2026-04-24T23:30:00-08:00');
      const hijriFromLateNight = umalqura(lateNightDate);

      const earlyMorningDate = new Date('2026-04-25T00:30:00Z');
      const hijriFromEarlyMorning = umalqura(earlyMorningDate);

      const week1 = getCurrentQuranicCalendarWeek(hijriFromLateNight);
      const week2 = getCurrentQuranicCalendarWeek(hijriFromEarlyMorning);

      expect(week1).toEqual(week2);
      expect(week1).toEqual(6);
    });
  });

  describe('Performance', () => {
    it('should handle multiple calls efficiently', () => {
      const hijriDate = umalqura(1447, 10, 10);
      const results = [];

      for (let i = 0; i < 100; i += 1) {
        results.push(getCurrentQuranicCalendarWeek(hijriDate));
      }

      expect(new Set(results).size).toEqual(1);
      expect(results[0]).toEqual(2);
    });
  });

  describe('Known week mappings', () => {
    it('should correctly identify weeks from the calendar data', () => {
      const knownMappings = [
        { hijri: umalqura(1447, 10, 3), expectedWeek: 1 },
        { hijri: umalqura(1447, 10, 10), expectedWeek: 2 },
        { hijri: umalqura(1447, 11, 13), expectedWeek: 6 },
        { hijri: umalqura(1447, 12, 24), expectedWeek: 12 },
        { hijri: umalqura(1448, 6, 26), expectedWeek: 38 },
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
        umalqura(1447, 9, 29), // Before calendar start
        umalqura(1447, 10, 10), // During calendar
        umalqura(1448, 9, 1), // After calendar end
      ];

      dates.forEach((date) => {
        const result = getCurrentQuranicCalendarWeek(date);
        expect(result).toBeGreaterThanOrEqual(0);
      });
    });

    it('should return values within valid range (0-46)', () => {
      for (let month = 10; month <= 12; month += 1) {
        for (let day = 1; day <= 20; day += 5) {
          const hijriDate = umalqura(1447, month, day);
          const result = getCurrentQuranicCalendarWeek(hijriDate);
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(46);
        }
      }
    });
  });
});
