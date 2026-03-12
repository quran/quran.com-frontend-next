import { describe, expect, it } from 'vitest';

import {
  getLocalizedWeekRangeLabel,
  HIJRI_MONTH_ORDER,
  WEEK_GROUPS,
} from './weekProgressConstants';

describe('WEEK_GROUPS', () => {
  it('matches the seven configured Quran in a Year ranges', () => {
    expect(WEEK_GROUPS).toEqual([
      { key: 'weeks-1-9', title: 'Week 1-9', startWeek: 1, endWeek: 9 },
      { key: 'weeks-10-18', title: 'Week 10-18', startWeek: 10, endWeek: 18 },
      { key: 'weeks-19-23', title: 'Week 19-23', startWeek: 19, endWeek: 23 },
      { key: 'weeks-24-29', title: 'Week 24-29', startWeek: 24, endWeek: 29 },
      { key: 'weeks-30-35', title: 'Week 30-35', startWeek: 30, endWeek: 35 },
      { key: 'weeks-36-40', title: 'Week 36-40', startWeek: 36, endWeek: 40 },
      { key: 'weeks-41-46', title: 'Week 41-46', startWeek: 41, endWeek: 46 },
    ]);
  });

  it('covers every week from 1 through 46 without gaps or overlaps', () => {
    const coveredWeeks = WEEK_GROUPS.flatMap((group) =>
      Array.from(
        { length: group.endWeek - group.startWeek + 1 },
        (unusedValue, index) => group.startWeek + index,
      ),
    );

    expect(coveredWeeks).toEqual(Array.from({ length: 46 }, (unusedValue, index) => index + 1));
  });
});

describe('HIJRI_MONTH_ORDER', () => {
  it("keeps the month sequence from Shawwal through Sha'ban", () => {
    expect(HIJRI_MONTH_ORDER).toEqual([10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe('getLocalizedWeekRangeLabel', () => {
  it('localizes the week text and range in LTR locales', () => {
    expect(getLocalizedWeekRangeLabel(1, 9, 'en', 'Week')).toBe(
      'Week <span data-week-range>1 - 9</span>',
    );
  });

  it('keeps LTR order for Urdu as requested', () => {
    expect(getLocalizedWeekRangeLabel(1, 9, 'ur', 'ہفتہ')).toBe(
      'ہفتہ <span data-week-range>1 - 9</span>',
    );
  });
});
