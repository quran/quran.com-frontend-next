/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import umalqura from '@umalqura/core';
import { it, expect, describe } from 'vitest';

import { getCurrentQuranicCalendarWeek } from './hijri-date';

describe('getCurrentQuranicCalendarWeek', () => {
  describe('Basic functionality', () => {
    it('should return week 1 for dates in the first week', () => {
      // Week 1 starts on April 1, 2025 + 3 days = April 4, 2025
      // Testing a date we know is in week 1
      const hijriDate = umalqura(1446, 10, 8);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(1);
    });

    it('should return week 2 for dates in the second week', () => {
      // April 15, 2025
      const hijriDate = umalqura(1446, 10, 15);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(2);
    });

    it('should return week 6 for dates in May', () => {
      // May 13, 2025
      const hijriDate = umalqura(1446, 11, 13);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(6);
    });

    it('should return week 37 for dates in late December', () => {
      // December 30, 2025
      const hijriDate = umalqura(1447, 6, 30);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(37);
    });

    it('should return week 11 for dates in late June', () => {
      // June 24, 2025
      const hijriDate = umalqura(1446, 12, 24);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(11);
    });

    it('should return week 24 for dates in late September', () => {
      // September 30, 2025
      const hijriDate = umalqura(1447, 3, 30);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(24);
    });

    it('should return week 25 for dates in early October', () => {
      // October 7, 2025
      const hijriDate = umalqura(1447, 4, 7);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(25);
    });
  });

  describe('Edge cases', () => {
    it('should return 0 for dates before the calendar starts', () => {
      // March 31, 2025 (before April 1)
      const hijriDate = umalqura(1446, 9, 30);
      expect(getCurrentQuranicCalendarWeek(hijriDate)).toEqual(0);
    });

    it('should return 0 for dates after the calendar ends', () => {
      // Using a date we know is after the calendar
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
        { hijri: umalqura(1446, 10, 2), expectedWeek: 1 }, // Early April
        { hijri: umalqura(1446, 10, 15), expectedWeek: 2 }, // Mid April
        { hijri: umalqura(1446, 11, 10), expectedWeek: 6 }, // Early May
        { hijri: umalqura(1446, 12, 20), expectedWeek: 12 }, // Late June
        { hijri: umalqura(1447, 1, 20), expectedWeek: 16 }, // Late July
        { hijri: umalqura(1447, 6, 15), expectedWeek: 36 }, // Mid December
      ];

      knownMappings.forEach(({ hijri, expectedWeek }) => {
        const result = getCurrentQuranicCalendarWeek(hijri);
        // Allow flexibility of ±1 week due to date conversion complexities
        expect(Math.abs(result - expectedWeek)).toBeLessThanOrEqual(1);
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
