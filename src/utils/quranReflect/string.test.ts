import { it, expect } from 'vitest';

import { getCitationSummary } from './string';

it('should get citation summary correctly when it is a range of verses', () => {
  const groupAyahNumbers = [1, 2, 3, 4, 5, 6, 7];
  const groupSurahNumber = 1;
  const chapterName = 'The Opening';

  const result = getCitationSummary(groupAyahNumbers, groupSurahNumber, chapterName);
  const expected = 'Chapter 1: The Opening, Verses:  1 - 7';

  expect(result).toBe(expected);
});

it('should get citation summary correctly when it is a single verse', () => {
  const groupAyahNumbers = [1];
  const groupSurahNumber = 1;
  const chapterName = 'The Opening';

  const result = getCitationSummary(groupAyahNumbers, groupSurahNumber, chapterName);
  const expected = 'Chapter 1: The Opening, Verse:  1';

  expect(result).toBe(expected);
});
