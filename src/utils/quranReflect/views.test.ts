import { it, expect } from 'vitest';

import {
  getInitialVisiblePostPercentage,
  estimateReadingTimeOfInitialVisiblePortion,
  MAX_REFLECTION_LENGTH,
} from './views';

it('[getInitialVisiblePostPercentage] should return 100 if the post is short', () => {
  const result = getInitialVisiblePostPercentage(MAX_REFLECTION_LENGTH - 1);
  const expected = 100;

  expect(result).toBe(expected);
});

it('[getInitialVisiblePostPercentage] should return correct percentage if the post is long', () => {
  const result = getInitialVisiblePostPercentage(MAX_REFLECTION_LENGTH * 2);
  const expected = 50;

  expect(result).toBe(expected);
});

it("[estimateReadingTimeOfInitialVisiblePortion] should return entire post's when the post is short", () => {
  const totalEstimatedTime = 5000;
  const result = estimateReadingTimeOfInitialVisiblePortion(
    getInitialVisiblePostPercentage(MAX_REFLECTION_LENGTH - 1),
    totalEstimatedTime,
  );
  const expected = totalEstimatedTime;

  expect(result).toBe(expected);
});

it('[estimateReadingTimeOfInitialVisiblePortion] should calculate correct time when post is long', () => {
  const totalEstimatedTime = 5000;
  const result = estimateReadingTimeOfInitialVisiblePortion(
    getInitialVisiblePostPercentage(MAX_REFLECTION_LENGTH * 2),
    totalEstimatedTime,
  );
  const expected = totalEstimatedTime / 2;

  expect(result).toBe(expected);
});
