import { decamelizeKeys } from 'humps';
import { it, expect } from 'vitest';

import stringify from './qs-stringify';

it('can stringify object', () => {
  const input = {
    words: true,
    translations: '149',
    translationFields: 'resource_name',
    limit: 10,
    fields: 'text_uthmani,chapter_id',
    reciter: 5,
    page: 1,
    mushaf: 4,
    wordFields: 'verse_key, verse_id, page_number, location, text_uthmani, text_indopak',
  };

  const result = stringify(decamelizeKeys(input));
  const expected =
    'words=true&translations=149&translation_fields=resource_name&limit=10&fields=text_uthmani%2Cchapter_id&reciter=5&page=1&mushaf=4&word_fields=verse_key%2C%20verse_id%2C%20page_number%2C%20location%2C%20text_uthmani%2C%20text_indopak';

  expect(result).toBe(expected);
});
it('ignore null values', () => {
  const input = { translations: null, fields: 'text_uthmani,chapter_id' };

  const result = stringify(decamelizeKeys(input));
  expect(result).toBe('fields=text_uthmani%2Cchapter_id');
});

it('does not split array values', () => {
  const input = { tafsirs: [171, 169], fields: 'text_uthmani,chapter_id' };

  const result = stringify(decamelizeKeys(input));
  expect(result).toBe('tafsirs=171%2C169&fields=text_uthmani%2Cchapter_id');
});

it('should stringify one pair key-value', () => {
  expect(stringify({ a: '1' })).toBe('a=1');
});

it('should stringify two pairs key-value', () => {
  expect(stringify({ a: '1', b: 's' })).toBe('a=1&b=s');
});

it('should stringify the array to same name key', () => {
  expect(stringify({ a: '1', b: ['s', 's2'] })).toBe('a=1&b=s%2Cs2');
});

it('should stringify the boolean value', () => {
  expect(stringify({ a: '1', b: 's', c: false })).toBe('a=1&b=s&c=false');
});

it('should stringify it when if the value need to encoded', () => {
  const str = 'test=test%20%26*%20test';
  expect(stringify({ test: 'test &* test' })).toBe(str);
});

it('should stringify it when if the key and value need to encoded', () => {
  const str = 'test%3D=test%20%26*%20test';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  expect(stringify({ 'test=': 'test &* test' })).toBe(str);
});

it('can stringify with custom eq and sep', () => {
  const str = 'a#1|b#s%2Cs2';
  expect(stringify({ a: '1', b: ['s', 's2'] }, { eq: '#', sep: '|' })).toBe(str);
});

it('should stringify it for customize value', () => {
  const fn = (key, value) => {
    if (key === 'c') return value ? 'on' : 'off';
    return value;
  };
  const obj = { a: 'test', b: 1, c: true };
  const str = 'a=test&b=1&c=on';
  expect(stringify(obj, { fn })).toBe(str);
});

it('can stringify nested value', () => {
  const str = 'foo[bar]=baz';
  expect(stringify({ foo: { bar: 'baz' } })).toBe(str);
});

it('can stringify deep nested value', () => {
  const str = 'foo[bar][waw]=baz';
  expect(stringify({ foo: { bar: { waw: 'baz' } } })).toBe(str);
});

it('can stringify deep nested encoded value', () => {
  const str = 'foo[%25aw][%25aw]=baz';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  expect(stringify({ foo: { '%aw': { '%aw': 'baz' } } })).toBe(str);
});
