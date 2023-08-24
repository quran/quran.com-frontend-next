/* eslint-disable react-func/max-lines-per-function */
import { it, expect, describe } from 'vitest';

import { getAllChaptersData } from '../../../utils/chapter';

import { isValidVerseRange } from './validator';

describe('areValidReadingRanges', () => {
  it('invalid startVerse should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(
      isValidVerseRange(chaptersData, {
        startVerse: '111111',
        endVerse: '1:2',
      }),
    ).toEqual(false);
  });

  it('invalid endVerse should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(
      isValidVerseRange(chaptersData, {
        startVerse: '1:2',
        endVerse: '111111',
      }),
    ).toEqual(false);
  });

  it('invalid startVerse and endVerse should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(
      isValidVerseRange(chaptersData, {
        startVerse: '111111',
        endVerse: '111111',
      }),
    ).toEqual(false);
  });

  it('valid startVerse and endVerse should succeed', async () => {
    const chaptersData = await getAllChaptersData();
    expect(
      isValidVerseRange(chaptersData, {
        startVerse: '1:1',
        endVerse: '5:1',
      }),
    ).toEqual(true);
  });

  it('startVerse ahead of endVerse should fail', async () => {
    const chaptersData = await getAllChaptersData();
    expect(
      isValidVerseRange(chaptersData, {
        startVerse: '5:1',
        endVerse: '1:1',
      }),
    ).toEqual(false);
  });

  it('same startVerse and endVerse should succeed', async () => {
    const chaptersData = await getAllChaptersData();
    expect(
      isValidVerseRange(chaptersData, {
        startVerse: '1:1',
        endVerse: '1:1',
      }),
    ).toEqual(true);
  });
});
