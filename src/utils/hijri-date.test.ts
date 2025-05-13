/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import umalqura from '@umalqura/core';
import { it, expect, describe } from 'vitest';

import { getCurrentQuranicCalendarWeek } from './hijri-date';

describe('consolidateWordByWordState', () => {
  it('detects successfully', () => {
    // 2025-04-03 (falls within first week)
    const hijriDate = umalqura(1446, 10, 3);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(0);
  });
  it('detects successfully', () => {
    // 2025-04-15
    const hijriDate = umalqura(1446, 10, 15);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(2);
  });
  it('detects successfully', () => {
    // 2025-05-13
    const hijriDate = umalqura(1446, 11, 13);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(6);
  });
  it('detects successfully', () => {
    // 2025-12-30
    const hijriDate = umalqura(1447, 6, 30);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(37);
  });
  it('detects successfully', () => {
    // 2025-06-24
    const hijriDate = umalqura(1446, 12, 24);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(11);
  });
  it('detects successfully', () => {
    // 2025-09-30
    const hijriDate = umalqura(1447, 3, 30);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(24);
  });
  it('detects successfully', () => {
    // 2025-10-07
    const hijriDate = umalqura(1447, 4, 7);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(25);
  });
});
