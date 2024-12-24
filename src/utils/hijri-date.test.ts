/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import umalqura from '@umalqura/core';
import { it, expect, describe } from 'vitest';

import { getCurrentQuranicCalendarWeek } from './hijri-date';

describe('consolidateWordByWordState', () => {
  it('detects successfully', () => {
    // 2024-04-12
    const hijriDate = umalqura(1445, 10, 3);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(1);
  });
  it('detects successfully', () => {
    // 2024-04-27
    const hijriDate = umalqura(1445, 10, 18);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(3);
  });
  it('detects successfully', () => {
    // 2024-05-24
    const hijriDate = umalqura(1445, 11, 16);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(7);
  });
  it('detects successfully', () => {
    // 2025-01-11
    const hijriDate = umalqura(1446, 7, 11);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(40);
  });
  it('detects successfully', () => {
    // 2024-07-06
    const hijriDate = umalqura(1445, 12, 30);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(13);
  });
  it('detects successfully', () => {
    // 2024-10-17
    const hijriDate = umalqura(1446, 4, 14);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(27);
  });
  it('detects successfully', () => {
    // 2024-10-18
    const hijriDate = umalqura(1446, 4, 15);
    const actual = getCurrentQuranicCalendarWeek(hijriDate);

    expect(actual).toEqual(28);
  });
});
