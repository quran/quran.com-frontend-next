/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import {
  QDC_PREFS_COOKIE_NAME,
  QDC_PREFS_KEY_COOKIE_NAME,
  QDC_PREFS_VER_COOKIE_NAME,
  QDC_PREFS_SCHEMA_VERSION,
  buildQdcPreferencesDocumentCookies,
  clearQdcPreferencesCookies,
  decodeQdcPreferencesCookie,
  getQdcPreferencesFromCookieHeader,
} from './qdcPreferencesCookies';

const base64UrlEncodeUtf8 = (value: string) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const cookieHeaderFromSetCookieStrings = (setCookies: string[]) =>
  setCookies
    .map((c) => c.split(';')[0])
    .filter(Boolean)
    .join('; ');

describe('qdcPreferencesCookies', () => {
  it('builds cookies and parses them back from a Cookie header', () => {
    const preferences = {
      translations: { selectedTranslations: [131] },
      tafsirs: { selectedTafsirs: ['169'] },
      quranReaderStyles: { quranFont: 'code_v2', mushafLines: '16_lines' },
      reading: { selectedWordByWordLocale: 'en' },
      audio: { reciter: 7, playbackRate: 1 },
      userHasCustomised: { userHasCustomised: true },
      // An unknown group should be dropped when decoding.
      unknownGroup: { foo: 'bar' },
    } as any;

    const built = buildQdcPreferencesDocumentCookies(preferences, {
      expires: new Date(Date.now() + 60_000),
    });
    expect(built).not.toBeNull();
    expect(built?.cookies).toHaveLength(3);
    expect(typeof built?.prefsKey).toBe('string');

    const cookieHeader = cookieHeaderFromSetCookieStrings(built!.cookies);
    const { preferences: decoded, preferencesKey } =
      getQdcPreferencesFromCookieHeader(cookieHeader);

    expect(preferencesKey).toBe(built!.prefsKey);
    expect(decoded).toBeTruthy();
    expect((decoded as any).unknownGroup).toBeUndefined();
    expect((decoded as any).translations?.selectedTranslations).toEqual([131]);
    expect((decoded as any).quranReaderStyles?.quranFont).toBe('code_v2');
  });

  it('returns null when QDC_PREFS cookie value is oversized', () => {
    expect(decodeQdcPreferencesCookie('a'.repeat(5000))).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(decodeQdcPreferencesCookie('%%%not-base64%%%')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    const encoded = base64UrlEncodeUtf8('not json');
    expect(decodeQdcPreferencesCookie(encoded)).toBeNull();
  });

  it('rejects cookie headers with an unsupported QDC_PREFS_VER', () => {
    const preferences = { translations: { selectedTranslations: [131] } } as any;
    const built = buildQdcPreferencesDocumentCookies(preferences, {
      expires: new Date(Date.now() + 60_000),
    })!;

    const cookieHeader = cookieHeaderFromSetCookieStrings(built.cookies);
    const poisoned = cookieHeader.replace(
      `${QDC_PREFS_VER_COOKIE_NAME}=${QDC_PREFS_SCHEMA_VERSION}`,
      `${QDC_PREFS_VER_COOKIE_NAME}=999`,
    );

    const { preferences: decoded, preferencesKey } = getQdcPreferencesFromCookieHeader(poisoned);
    expect(decoded).toBeNull();
    expect(preferencesKey).toBeNull();
  });

  it('treats invalid QDC_PREFS_KEY as null (but still decodes preferences)', () => {
    const preferences = { translations: { selectedTranslations: [131] } } as any;
    const built = buildQdcPreferencesDocumentCookies(preferences, {
      expires: new Date(Date.now() + 60_000),
    })!;

    const cookieHeader = cookieHeaderFromSetCookieStrings(built.cookies).replace(
      new RegExp(`${QDC_PREFS_KEY_COOKIE_NAME}=[^;]+`),
      `${QDC_PREFS_KEY_COOKIE_NAME}=not@allowed`,
    );

    const { preferences: decoded, preferencesKey } =
      getQdcPreferencesFromCookieHeader(cookieHeader);
    expect(decoded).toBeTruthy();
    expect(preferencesKey).toBeNull();
  });

  it('produces a stable prefsKey regardless of object key order', () => {
    const a = {
      translations: { selectedTranslations: [131] },
      quranReaderStyles: { quranFont: 'code_v2', mushafLines: '16_lines' },
      reading: { selectedWordByWordLocale: 'en' },
      userHasCustomised: { userHasCustomised: false },
    } as any;

    const b = {
      userHasCustomised: { userHasCustomised: false },
      reading: { selectedWordByWordLocale: 'en' },
      quranReaderStyles: { mushafLines: '16_lines', quranFont: 'code_v2' },
      translations: { selectedTranslations: [131] },
    } as any;

    const builtA = buildQdcPreferencesDocumentCookies(a, {
      expires: new Date(Date.now() + 60_000),
    })!;
    const builtB = buildQdcPreferencesDocumentCookies(b, {
      expires: new Date(Date.now() + 60_000),
    })!;

    expect(builtA.prefsKey).toBe(builtB.prefsKey);
  });

  it('changes prefsKey when SSR-relevant preferences change', () => {
    const a = { quranReaderStyles: { quranFont: 'code_v2' } } as any;
    const b = { quranReaderStyles: { quranFont: 'text_indopak' } } as any;

    const builtA = buildQdcPreferencesDocumentCookies(a, {
      expires: new Date(Date.now() + 60_000),
    })!;
    const builtB = buildQdcPreferencesDocumentCookies(b, {
      expires: new Date(Date.now() + 60_000),
    })!;

    expect(builtA.prefsKey).not.toBe(builtB.prefsKey);
  });

  it('clearQdcPreferencesCookies returns three expired Set-Cookie strings', () => {
    const cleared = clearQdcPreferencesCookies({ secure: true });
    expect(cleared).toHaveLength(3);
    expect(cleared[0]).toContain(`${QDC_PREFS_COOKIE_NAME}=`);
    expect(cleared[1]).toContain(`${QDC_PREFS_KEY_COOKIE_NAME}=`);
    expect(cleared[2]).toContain(`${QDC_PREFS_VER_COOKIE_NAME}=`);
    cleared.forEach((c) => expect(c).toContain('Expires=Thu, 01 Jan 1970'));
  });
});
