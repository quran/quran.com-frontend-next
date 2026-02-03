/* eslint-disable max-lines */
/* eslint-disable no-bitwise */
import cookie from 'cookie';

import PreferenceGroup from 'types/auth/PreferenceGroup';
import UserPreferencesResponse from 'types/auth/UserPreferencesResponse';

export const QDC_MANUAL_LOCALE_COOKIE_NAME = 'QDC_MANUAL_LOCALE';
export const QDC_PREFS_COOKIE_NAME = 'QDC_PREFS';
export const QDC_PREFS_KEY_COOKIE_NAME = 'QDC_PREFS_KEY';
export const QDC_PREFS_VER_COOKIE_NAME = 'QDC_PREFS_VER';

export const QDC_PREFS_SCHEMA_VERSION = '1';

const MAX_PREFS_COOKIE_LENGTH = 4096;

const getAllowedPreferenceGroupsSet = (): Set<string> => new Set(Object.values(PreferenceGroup));

const stableSortJsonValue = (value: unknown): unknown => {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stableSortJsonValue);

  const obj = value as Record<string, unknown>;
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, unknown> = {};

  sortedKeys.forEach((key) => {
    const v = obj[key];
    // Drop undefined values to match JSON.stringify behavior and keep output stable.
    if (typeof v === 'undefined') return;
    result[key] = stableSortJsonValue(v);
  });

  return result;
};

const stableStringify = (value: unknown): string => JSON.stringify(stableSortJsonValue(value));

const base64UrlEncode = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  const base64 =
    typeof window === 'undefined'
      ? Buffer.from(bytes).toString('base64')
      : (() => {
          let binary = '';
          for (let i = 0; i < bytes.length; i += 1) {
            binary += String.fromCharCode(bytes[i]);
          }
          return btoa(binary);
        })();
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const base64UrlDecode = (value: string): string | null => {
  if (!value) return null;

  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');

  try {
    if (typeof window === 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf8');
    }
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
};

// Stable, fast, non-cryptographic hash (deterministic across JS engines).
// Produces a short key suitable for cache bucketing.
// Source pattern: cyrb53 (public domain).
const stableHashToKey = (value: string): string => {
  let h1 = 0xdeadbeef ^ value.length;
  let h2 = 0x41c6ce57 ^ value.length;

  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return hash.toString(36);
};

export const parseCookieHeader = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  try {
    return cookie.parse(cookieHeader);
  } catch {
    return {};
  }
};

const sanitizePreferences = (raw: unknown): UserPreferencesResponse | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

  const allowedGroups = getAllowedPreferenceGroupsSet();
  const sanitized: Record<string, any> = {};

  Object.entries(raw as Record<string, unknown>).forEach(([key, value]) => {
    if (!allowedGroups.has(key)) return;
    sanitized[key] = value;
  });

  return sanitized as UserPreferencesResponse;
};

export const decodeQdcPreferencesCookie = (
  encodedValue?: string,
): UserPreferencesResponse | null => {
  if (!encodedValue) return null;
  if (encodedValue.length > MAX_PREFS_COOKIE_LENGTH) return null;

  const decoded = base64UrlDecode(encodedValue);
  if (!decoded) return null;
  if (decoded.length > MAX_PREFS_COOKIE_LENGTH) return null;

  try {
    const parsed = JSON.parse(decoded);
    return sanitizePreferences(parsed);
  } catch {
    return null;
  }
};

export const getQdcPreferencesFromCookieHeader = (
  cookieHeader?: string,
): { preferences: UserPreferencesResponse | null; preferencesKey: string | null } => {
  const cookies = parseCookieHeader(cookieHeader);
  const prefsVer = cookies[QDC_PREFS_VER_COOKIE_NAME];
  if (prefsVer && prefsVer !== QDC_PREFS_SCHEMA_VERSION) {
    return { preferences: null, preferencesKey: null };
  }
  const preferences = decodeQdcPreferencesCookie(cookies[QDC_PREFS_COOKIE_NAME]);
  const rawKey = cookies[QDC_PREFS_KEY_COOKIE_NAME];
  const preferencesKey = rawKey && /^[0-9a-z]+$/i.test(rawKey) ? rawKey : null;
  return { preferences, preferencesKey };
};

export const buildQdcPreferencesCookies = (
  preferences: UserPreferencesResponse,
  opts: { expires: Date; secure?: boolean } = { expires: new Date(Date.now() + 31536000000) },
): {
  prefsCookie: string;
  prefsKeyCookie: string;
  prefsVerCookie: string;
  prefsKey: string;
} | null => {
  const json = stableStringify(preferences);
  const encodedPrefs = base64UrlEncode(json);

  // Reject if the cookie would exceed typical browser limits.
  if (encodedPrefs.length > MAX_PREFS_COOKIE_LENGTH) return null;

  const prefsKey = stableHashToKey(json);

  const baseAttributes = [
    `Path=/`,
    `Expires=${opts.expires.toUTCString()}`,
    `SameSite=Lax`,
    ...(opts.secure ? ['Secure'] : []),
  ].join('; ');

  return {
    prefsCookie: `${QDC_PREFS_COOKIE_NAME}=${encodedPrefs}; ${baseAttributes}`,
    prefsKeyCookie: `${QDC_PREFS_KEY_COOKIE_NAME}=${prefsKey}; ${baseAttributes}`,
    prefsVerCookie: `${QDC_PREFS_VER_COOKIE_NAME}=${QDC_PREFS_SCHEMA_VERSION}; ${baseAttributes}`,
    prefsKey,
  };
};

export const buildQdcPreferencesDocumentCookies = (
  preferences: UserPreferencesResponse,
  opts: { expires: Date; secure?: boolean } = { expires: new Date(Date.now() + 31536000000) },
): { cookies: string[]; prefsKey: string } | null => {
  const built = buildQdcPreferencesCookies(preferences, opts);
  if (!built) return null;
  const { prefsCookie, prefsKeyCookie, prefsVerCookie, prefsKey } = built;
  return { cookies: [prefsCookie, prefsKeyCookie, prefsVerCookie], prefsKey };
};

export const clearQdcPreferencesCookies = (opts: { secure?: boolean } = {}): string[] => {
  const expires = new Date(0);
  const baseAttributes = [
    `Path=/`,
    `Expires=${expires.toUTCString()}`,
    `SameSite=Lax`,
    ...(opts.secure ? ['Secure'] : []),
  ].join('; ');

  return [
    `${QDC_PREFS_COOKIE_NAME}=; ${baseAttributes}`,
    `${QDC_PREFS_KEY_COOKIE_NAME}=; ${baseAttributes}`,
    `${QDC_PREFS_VER_COOKIE_NAME}=; ${baseAttributes}`,
  ];
};
