/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import { convertHexToRGBA, getNormalizedIntervals } from './helpers';

describe('convertHexToRGBA', () => {
  it('accepts a hex value of 6 numbers and returns a rgba color string', () => {
    expect(convertHexToRGBA('#F3F3F3')).toBe('rgba(243,243,243,1)');
  });

  it('accepts a hex value of 6 numbers with opacity of 1 and returns same color string', () => {
    expect(convertHexToRGBA('#000', 1)).toBe(convertHexToRGBA('#000'));
  });

  it('accepts a hex value of 6 numbers with opacity and returns a rgba color string', () => {
    expect(convertHexToRGBA('#000', 0.5)).toBe('rgba(0,0,0,0.5)');
  });

  it('accepts a hex value of 3 numbers and returns a rgba color string', () => {
    expect(convertHexToRGBA('#aaa')).toBe('rgba(170,170,170,1)');
  });

  it('accepts a hex value of 3 numbers with opacity and returns a rgba color string', () => {
    expect(convertHexToRGBA('#aaa', 0.5)).toBe('rgba(170,170,170,0.5)');
  });

  it('accepts a hex value of 3 numbers with opacity of 1 and returns same color string', () => {
    expect(convertHexToRGBA('#aaa', 1)).toBe(convertHexToRGBA('#aaa', 1));
  });
});

describe('getNormalizedIntervals', () => {
  it('should return correct normalized start and duration in frames for standard input', () => {
    const result = getNormalizedIntervals(1000, 5000, 30);
    expect(result).toEqual({ start: 30, durationInFrames: 120 });
  });

  it('should return correct values when frames per second is 60', () => {
    const result = getNormalizedIntervals(1000, 5000, 60);
    expect(result).toEqual({ start: 60, durationInFrames: 240 });
  });

  it('should handle start and end times that are very close', () => {
    const result = getNormalizedIntervals(1000, 1001, 30);
    expect(result).toEqual({ start: 30, durationInFrames: 1 });
  });

  it('should handle start and end times that are equal', () => {
    const result = getNormalizedIntervals(1000, 1000, 30);
    expect(result).toEqual({ start: 30, durationInFrames: 0 });
  });

  it('should handle start time greater than end time', () => {
    const result = getNormalizedIntervals(5000, 1000, 30);
    expect(result).toEqual({ start: 150, durationInFrames: -120 });
  });

  it('should handle negative start and end times', () => {
    const result = getNormalizedIntervals(-1000, -500, 30);
    expect(result).toEqual({ start: -30, durationInFrames: 15 });
  });

  it('should handle zero frames per second', () => {
    const result = getNormalizedIntervals(1000, 5000, 0);
    expect(result).toEqual({ start: 0, durationInFrames: 0 });
  });

  it('should handle very small start and end times', () => {
    const result = getNormalizedIntervals(0.1, 0.2, 30);
    expect(result).toEqual({ start: 1, durationInFrames: 1 });
  });

  it('should handle very large start and end times', () => {
    const result = getNormalizedIntervals(1000000, 2000000, 30);
    expect(result).toEqual({ start: 30000, durationInFrames: 30000 });
  });

  it('should handle very small frames per second', () => {
    const result = getNormalizedIntervals(1000, 5000, 0.1);
    expect(result).toEqual({ start: 1, durationInFrames: 1 });
  });

  it('should handle very large frames per second', () => {
    const result = getNormalizedIntervals(1000, 5000, 1000);
    expect(result).toEqual({ start: 1000, durationInFrames: 4000 });
  });

  it('should handle start time of zero', () => {
    const result = getNormalizedIntervals(0, 5000, 30);
    expect(result).toEqual({ start: 0, durationInFrames: 150 });
  });

  it('should handle end time of zero', () => {
    const result = getNormalizedIntervals(1000, 0, 30);
    expect(result).toEqual({ start: 30, durationInFrames: -30 });
  });

  it('should handle zero start and end times', () => {
    const result = getNormalizedIntervals(0, 0, 30);
    expect(result).toEqual({ start: 0, durationInFrames: 0 });
  });
});
