import { describe, expect, test } from 'vitest';

import { convertHexToRGBA } from './helpers';

describe('convertHexToRGBA', () => {
  test('accepts a hex value of 6 numbers and returns a rgba color string', () => {
    expect(convertHexToRGBA('#F3F3F3')).toBe('rgba(243,243,243,1)');
  });

  test('accepts a hex value of 6 numbers with opacity of 1 and returns same color string', () => {
    expect(convertHexToRGBA('#000', 1)).toBe(convertHexToRGBA('#000'));
  });

  test('accepts a hex value of 6 numbers with opacity and returns a rgba color string', () => {
    expect(convertHexToRGBA('#000', 0.5)).toBe('rgba(0,0,0,0.5)');
  });

  test('accepts a hex value of 3 numbers and returns a rgba color string', () => {
    expect(convertHexToRGBA('#aaa')).toBe('rgba(170,170,170,1)');
  });

  test('accepts a hex value of 3 numbers with opacity and returns a rgba color string', () => {
    expect(convertHexToRGBA('#aaa', 0.5)).toBe('rgba(170,170,170,0.5)');
  });

  test('accepts a hex value of 3 numbers with opacity of 1 and returns same color string', () => {
    expect(convertHexToRGBA('#aaa', 1)).toBe(convertHexToRGBA('#aaa', 1));
  });
});
