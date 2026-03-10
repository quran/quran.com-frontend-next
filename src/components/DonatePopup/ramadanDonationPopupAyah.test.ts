import { describe, expect, it } from 'vitest';

import { getCurrentRamadanDonationPopupAyah } from './ramadanDonationPopupAyah';

describe('ramadanDonationPopupAyah', () => {
  it('returns the matching ayah for an exact campaign date', () => {
    expect(getCurrentRamadanDonationPopupAyah(new Date(2026, 2, 10, 12, 0, 0))).toEqual({
      chapter: 2,
      verse: 261,
      verseKey: '2:261',
    });
  });

  it('falls back to the first scheduled ayah before the 10 day window starts', () => {
    expect(getCurrentRamadanDonationPopupAyah(new Date(2026, 2, 9, 23, 59, 59))).toEqual({
      chapter: 2,
      verse: 261,
      verseKey: '2:261',
    });
  });

  it('returns the last scheduled ayah after the final campaign entry', () => {
    expect(getCurrentRamadanDonationPopupAyah(new Date(2026, 2, 21, 8, 0, 0))).toEqual({
      chapter: 2,
      verse: 245,
      verseKey: '2:245',
    });
  });
});
