import { it, expect } from 'vitest';

import { replaceBreaksWithSpans, formatHadithNumbers, parseHadithNumbers } from './utility';

import Language from '@/types/Language';

it('replaceBreaksWithSpans replaces single <br> tag', () => {
  expect(replaceBreaksWithSpans('<br>')).toBe('<span class="single"></span>');
  expect(replaceBreaksWithSpans('<br/>')).toBe('<span class="single"></span>');
  expect(replaceBreaksWithSpans('<br />')).toBe('<span class="single"></span>');
  expect(replaceBreaksWithSpans('text<br>more')).toBe('text<span class="single"></span>more');
});

it('replaceBreaksWithSpans replaces multiple consecutive <br> tags', () => {
  expect(replaceBreaksWithSpans('<br><br>')).toBe('<span class="multiline"></span>');
  expect(replaceBreaksWithSpans('<br/><br/>')).toBe('<span class="multiline"></span>');
  expect(replaceBreaksWithSpans('<br /><br />')).toBe('<span class="multiline"></span>');
  expect(replaceBreaksWithSpans('<br>\n<br>')).toBe('<span class="multiline"></span>');
  expect(replaceBreaksWithSpans('<br>  <br>')).toBe('<span class="multiline"></span>');
});

it('replaceBreaksWithSpans replaces three or more consecutive <br> tags', () => {
  expect(replaceBreaksWithSpans('<br><br><br>')).toBe('<span class="multiline"></span>');
  expect(replaceBreaksWithSpans('<br/><br/><br/>')).toBe('<span class="multiline"></span>');
  expect(replaceBreaksWithSpans('<br>\n<br>\n<br>')).toBe('<span class="multiline"></span>');
  expect(replaceBreaksWithSpans('<br><br><br><br><br>')).toBe('<span class="multiline"></span>');
});

it('replaceBreaksWithSpans handles mixed single and multiple breaks', () => {
  expect(replaceBreaksWithSpans('<br><br>text<br>')).toBe(
    '<span class="multiline"></span>text<span class="single"></span>',
  );
  expect(replaceBreaksWithSpans('text<br>more<br><br>end')).toBe(
    'text<span class="single"></span>more<span class="multiline"></span>end',
  );
  expect(replaceBreaksWithSpans('<br>text<br><br>more<br>end')).toBe(
    '<span class="single"></span>text<span class="multiline"></span>more<span class="single"></span>end',
  );
});

it('replaceBreaksWithSpans handles empty and no-break input', () => {
  expect(replaceBreaksWithSpans('')).toBe('');
  expect(replaceBreaksWithSpans('just text')).toBe('just text');
  expect(replaceBreaksWithSpans('<p>paragraph</p>')).toBe('<p>paragraph</p>');
});

it('replaceBreaksWithSpans handles case-insensitive matches', () => {
  expect(replaceBreaksWithSpans('<BR>')).toBe('<span class="single"></span>');
  expect(replaceBreaksWithSpans('<BR><BR>')).toBe('<span class="multiline"></span>');
  expect(replaceBreaksWithSpans('<Br>text<Br>')).toBe(
    '<span class="single"></span>text<span class="single"></span>',
  );
});

it('parseHadithNumbers works with single number', () => {
  expect(parseHadithNumbers('1', Language.EN)).toEqual([
    { number: '1', localized: '1', link: '1' },
  ]);
  expect(parseHadithNumbers('123', Language.EN)).toEqual([
    { number: '123', localized: '123', link: '123' },
  ]);
});

it('parseHadithNumbers works with multiple numbers separated by comma', () => {
  expect(parseHadithNumbers('1,2,3', Language.EN)).toEqual([
    { number: '1', localized: '1', link: '1' },
    { number: '2', localized: '2', link: '2' },
    { number: '3', localized: '3', link: '3' },
  ]);
  expect(parseHadithNumbers('1, 2, 3', Language.EN)).toEqual([
    { number: '1', localized: '1', link: '1' },
    { number: '2', localized: '2', link: '2' },
    { number: '3', localized: '3', link: '3' },
  ]);
});

it('parseHadithNumbers works with letters', () => {
  expect(parseHadithNumbers('1a', Language.EN)).toEqual([
    { number: '1', letter: 'a', localized: '1a', link: '1a' },
  ]);
  expect(parseHadithNumbers('1b,2c', Language.EN)).toEqual([
    { number: '1', letter: 'b', localized: '1b', link: '1b' },
    { number: '2', letter: 'c', localized: '2c', link: '2c' },
  ]);
});

it('parseHadithNumbers works with letters and optional spaces', () => {
  expect(parseHadithNumbers('1 a', Language.EN)).toEqual([
    { number: '1', letter: 'a', localized: '1a', link: '1a' },
  ]);
  expect(parseHadithNumbers('1 b, 2 c', Language.EN)).toEqual([
    { number: '1', letter: 'b', localized: '1b', link: '1b' },
    { number: '2', letter: 'c', localized: '2c', link: '2c' },
  ]);
  expect(parseHadithNumbers('1 a,2b,3 c', Language.EN)).toEqual([
    { number: '1', letter: 'a', localized: '1a', link: '1a' },
    { number: '2', letter: 'b', localized: '2b', link: '2b' },
    { number: '3', letter: 'c', localized: '3c', link: '3c' },
  ]);
});

it('parseHadithNumbers handles empty and invalid input', () => {
  expect(parseHadithNumbers('', Language.EN)).toEqual([]);
  expect(parseHadithNumbers('  ', Language.EN)).toEqual([]);
  expect(parseHadithNumbers(null as unknown as string, Language.EN)).toEqual([]);
  expect(parseHadithNumbers(undefined as unknown as string, Language.EN)).toEqual([]);
});

it('formatHadithNumbers formats single number in English', () => {
  expect(formatHadithNumbers('1', Language.EN)).toBe('1');
  expect(formatHadithNumbers('123', Language.EN)).toBe('123');
});

it('formatHadithNumbers formats multiple numbers in English', () => {
  expect(formatHadithNumbers('1,2,3', Language.EN)).toBe('1, 2, 3');
  expect(formatHadithNumbers('1a,2b', Language.EN)).toBe('1a, 2b');
});

it('formatHadithNumbers formats numbers with letters in English', () => {
  expect(formatHadithNumbers('1a', Language.EN)).toBe('1a');
  expect(formatHadithNumbers('1 a, 2 b', Language.EN)).toBe('1a, 2b');
  expect(formatHadithNumbers('1 a,2b,3 c', Language.EN)).toBe('1a, 2b, 3c');
});

it('formatHadithNumbers formats single number in Arabic', () => {
  expect(formatHadithNumbers('1', Language.AR)).toBe('١');
  expect(formatHadithNumbers('123', Language.AR)).toBe('١٢٣');
});

it('formatHadithNumbers formats multiple numbers in Arabic', () => {
  expect(formatHadithNumbers('1,2,3', Language.AR)).toBe('١, ٢, ٣');
  expect(formatHadithNumbers('1a,2b', Language.AR)).toBe('١a, ٢b');
});

it('formatHadithNumbers formats numbers with letters in Arabic', () => {
  expect(formatHadithNumbers('1a', Language.AR)).toBe('١a');
  expect(formatHadithNumbers('1 a, 2 b', Language.AR)).toBe('١a, ٢b');
  expect(formatHadithNumbers('1 a,2b,3 c', Language.AR)).toBe('١a, ٢b, ٣c');
});

it('formatHadithNumbers handles complex formats', () => {
  expect(formatHadithNumbers('1,2a,3 b', Language.EN)).toBe('1, 2a, 3b');
  expect(formatHadithNumbers('1,2a,3 b', Language.AR)).toBe('١, ٢a, ٣b');
  expect(formatHadithNumbers('10a,20b,30c', Language.AR)).toBe('١٠a, ٢٠b, ٣٠c');
});

it('formatHadithNumbers handles empty input', () => {
  expect(formatHadithNumbers('', Language.EN)).toBe('');
  expect(formatHadithNumbers('', Language.AR)).toBe('');
});
