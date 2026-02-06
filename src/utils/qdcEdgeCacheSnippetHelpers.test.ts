/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import {
  getCountryForDefaults,
  getUserIdCookieValue,
  normalizeCacheToken,
  normalizeUrlForCache,
  parseCookies,
  shouldBypassPath,
  shouldBypassQuery,
  splitLocaleFromPath,
  stableHashToKey,
  isPrivatePath,
} from './qdcEdgeCacheSnippetHelpers';

const SUPPORTED_LOCALES = [
  'en',
  'ar',
  'bn',
  'fa',
  'fr',
  'id',
  'it',
  'nl',
  'pt',
  'ru',
  'sq',
  'th',
  'tr',
  'ur',
  'zh',
  'ms',
  'es',
  'sw',
  'vi',
];

const BYPASS_PREFIXES = [
  '/api/',
  '/_next/',
  '/auth',
  '/logout',
  '/login',
  '/complete-signup',
  '/forgot-password',
  '/reset-password',
];

const PRIVATE_PREFIXES = ['/collections', '/profile', '/notes-and-reflections', '/reading-goal'];

describe('qdcEdgeCacheSnippetHelpers', () => {
  it('splitLocaleFromPath detects locale prefixes and returns the restPath', () => {
    expect(splitLocaleFromPath('/vi', SUPPORTED_LOCALES)).toEqual({
      urlLocale: 'vi',
      restPath: '/',
    });
    expect(splitLocaleFromPath('/en/1', SUPPORTED_LOCALES)).toEqual({
      urlLocale: 'en',
      restPath: '/1',
    });
    expect(splitLocaleFromPath('/1', SUPPORTED_LOCALES)).toEqual({
      urlLocale: null,
      restPath: '/1',
    });
  });

  it('getCountryForDefaults uses country for en/unsupported and forces US for supported non-en', () => {
    expect(getCountryForDefaults('en', 'CA', SUPPORTED_LOCALES)).toBe('CA');
    expect(getCountryForDefaults('vi', 'CA', SUPPORTED_LOCALES)).toBe('US');
    expect(getCountryForDefaults('xx', 'CA', SUPPORTED_LOCALES)).toBe('CA');
    expect(getCountryForDefaults('en', 'USA', SUPPORTED_LOCALES)).toBe('US');
  });

  it('normalizeUrlForCache strips tracking params and sorts remaining params', () => {
    const url = new URL('https://example.com/vi/1?utm_source=x&b=2&a=1&gclid=abc');
    expect(normalizeUrlForCache(url)).toBe('https://example.com/vi/1?a=1&b=2');
  });

  it('normalizeCacheToken validates tokens for cache bucketing', () => {
    expect(normalizeCacheToken(' demo123 ')).toBe('demo123');
    expect(normalizeCacheToken('not@allowed')).toBeNull();
    expect(normalizeCacheToken('')).toBeNull();
    expect(normalizeCacheToken('a'.repeat(65))).toBeNull();
  });

  it('stableHashToKey is deterministic', () => {
    expect(stableHashToKey('abc')).toBe(stableHashToKey('abc'));
    expect(stableHashToKey('abc')).not.toBe(stableHashToKey('abcd'));
  });

  it('parseCookies + getUserIdCookieValue extracts allowlisted id cookie values', () => {
    expect(getUserIdCookieValue(parseCookies('id=111; foo=bar'))).toBe('111');
    expect(getUserIdCookieValue(parseCookies('id_staging=222; foo=bar'))).toBe('222');
    expect(getUserIdCookieValue(parseCookies('id_staging2=333; foo=bar'))).toBe('333');
    expect(getUserIdCookieValue(parseCookies('id_tracker=444; foo=bar'))).toBeNull();
    expect(getUserIdCookieValue(parseCookies('foo=bar'))).toBeNull();
  });

  it('shouldBypassPath and shouldBypassQuery match configured bypass rules', () => {
    expect(shouldBypassPath('/api/foo', BYPASS_PREFIXES)).toBe(true);
    expect(shouldBypassPath('/_next/static/chunk.js', BYPASS_PREFIXES)).toBe(true);
    expect(shouldBypassPath('/login', BYPASS_PREFIXES)).toBe(true);
    expect(shouldBypassPath('/en/1', BYPASS_PREFIXES)).toBe(false);

    const params = new URLSearchParams('token=abc&x=1');
    expect(shouldBypassQuery(params, ['token', 'code'])).toBe(true);
    expect(shouldBypassQuery(new URLSearchParams('x=1'), ['token', 'code'])).toBe(false);
  });

  it('isPrivatePath matches configured private prefixes', () => {
    expect(isPrivatePath('/profile', PRIVATE_PREFIXES)).toBe(true);
    expect(isPrivatePath('/profile/edit', PRIVATE_PREFIXES)).toBe(true);
    expect(isPrivatePath('/1', PRIVATE_PREFIXES)).toBe(false);
  });
});
