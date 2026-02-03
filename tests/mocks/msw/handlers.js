/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
const { http, HttpResponse } = require('msw');

const { mockCountryLanguagePreferences } = require('../data');

const getEnvSuffix = () => {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  if (!appEnv || appEnv === 'production') return '';
  return `_${appEnv}`;
};

const cookieName = (base) => `${base}${getEnvSuffix()}`;

const parseCookies = (cookieHeader = '') => {
  const result = {};
  cookieHeader.split(';').forEach((cookie) => {
    const trimmed = cookie.trim();
    if (!trimmed) return;
    const [name, ...rest] = trimmed.split('=');
    if (!name) return;
    result[name] = rest.join('=') || '';
  });
  return result;
};

const getUserIdFromRequest = (request) => {
  const cookies = parseCookies(request.headers.get('cookie') || '');
  const envCookie = cookies[cookieName('id')];
  if (envCookie) return envCookie;
  if (cookies.id) return cookies.id;
  const fallbackKey = Object.keys(cookies).find((key) => key.startsWith('id_'));
  return fallbackKey ? cookies[fallbackKey] : null;
};

const parseVerseKey = (value) => {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^(\d+):(\d+)$/);
  if (!match) return null;
  return { chapterId: match[1], verseNumber: Number(match[2]) };
};

const buildMockWords = ({ verseKey, pageNumber = 1 }) => [
  {
    id: 1,
    position: 1,
    audio_url: 'wbw/001_001_001.mp3',
    char_type_name: 'word',
    page_number: pageNumber,
    line_number: 2,
    location: `${verseKey}:1`,
    text_uthmani: 'بِسْمِ',
    text: 'بِسْمِ',
    translation: { text: 'In (the) name', language_name: 'english' },
    transliteration: { text: "bis'mi", language_name: 'english' },
  },
  {
    id: 2,
    position: 2,
    audio_url: 'wbw/001_001_002.mp3',
    char_type_name: 'word',
    page_number: pageNumber,
    line_number: 2,
    location: `${verseKey}:2`,
    text_uthmani: 'ٱللَّهِ',
    text: 'ٱللَّهِ',
    translation: { text: '(of) Allah', language_name: 'english' },
    transliteration: { text: 'l-lahi', language_name: 'english' },
  },
  {
    id: 3,
    position: 3,
    audio_url: null,
    char_type_name: 'end',
    page_number: pageNumber,
    line_number: 2,
    location: `${verseKey}:3`,
    text_uthmani: '١',
    text: '١',
    translation: { text: '(1)', language_name: 'english' },
    transliteration: { text: null, language_name: 'english' },
  },
];

const buildMockVerse = ({ chapterId, verseNumber, translationIds }) => {
  const verseKey = `${chapterId}:${verseNumber}`;
  const translations = (translationIds?.length ? translationIds : [131]).map((id) => ({
    id,
    language_name: 'english',
    text: `Mock translation for ${verseKey}`,
    resource_name: 'MSW Mock',
  }));

  return {
    id: Number(`${chapterId}${String(verseNumber).padStart(3, '0')}`),
    verse_number: verseNumber,
    chapter_id: Number(chapterId),
    page_number: 1,
    juz_number: 1,
    hizb_number: 1,
    rub_number: 1,
    rub_el_hizb_number: 1,
    verse_key: verseKey,
    verse_index: verseNumber,
    words: buildMockWords({ verseKey, pageNumber: 1 }),
    text_uthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    text_imlaei_simple: 'بسم الله الرحمن الرحيم',
    sajdah_number: null,
    sajdah_type: null,
    translations,
    has_related_verses: false,
  };
};

// Test-specific data storage for per-test customization
const testDataStore = {
  preferences: null,
  pendingSignupPreferences: null,
  errorScenarios: {},
  reflections: null,
  loginResponse: null,
  countryLanguagePreference: null,
};

const preferencesByUser = new Map();

// Helper function to set test-specific data
function setTestData(type, data) {
  testDataStore[type] = data;
}

// Helper function to get test-specific data
function getTestData(type) {
  return testDataStore[type];
}

// Helper function to clear test data
function clearTestData() {
  testDataStore.preferences = null;
  testDataStore.pendingSignupPreferences = null;
  testDataStore.errorScenarios = {};
  testDataStore.reflections = null;
  testDataStore.loginResponse = null;
  testDataStore.countryLanguagePreference = null;
  preferencesByUser.clear();
}

// Mock data for different language/country combinations

// Helper function to handle error scenarios for country language preference
function handleCountryLanguagePreferenceErrors(errorScenarios) {
  if (errorScenarios && errorScenarios.countryLanguagePreference) {
    const errorConfig = errorScenarios.countryLanguagePreference;
    if (errorConfig.type === 'network_failure') {
      console.log('MSW: Simulating network failure');
      return new Response(null, { status: 500 });
    }
    if (errorConfig.type === 'invalid_combination') {
      console.log('MSW: Simulating invalid combination error');
      return HttpResponse.json(
        {
          error: 'Invalid language/country combination',
          code: 'INVALID_COMBINATION',
        },
        { status: 400 },
      );
    }
  }
  return null;
}

// Helper function to get country language preference mock data
function getCountryLanguagePreferenceMockData(userDeviceLanguage, country) {
  // Implement business logic: For non-English languages, ignore country and use US
  const isEnglish = userDeviceLanguage === 'en';
  const effectiveCountry = isEnglish ? country : 'US';
  const key = `${userDeviceLanguage}-${effectiveCountry}`;

  // Return mock data if available
  if (mockCountryLanguagePreferences[key]) {
    return mockCountryLanguagePreferences[key];
  }

  // For non-English languages not in the map, use generic non-English defaults
  if (!isEnglish) {
    return {
      country: 'US', // Always US for non-English per spec
      userDeviceLanguage,
      defaultMushaf: { id: 2 },
      defaultTranslations: [{ id: 20 }],
      defaultTafsir: { id: 'ar-tafseer-al-tabari' },
      defaultWbwLanguage: { isoCode: userDeviceLanguage },
      ayahReflectionsLanguages: [{ isoCode: userDeviceLanguage }, { isoCode: 'en' }],
    };
  }

  // English fallback
  return {
    country: country || 'US',
    userDeviceLanguage: 'en',
    defaultMushaf: { id: 1 },
    defaultTranslations: [{ id: 131 }],
    defaultTafsir: { id: 'en-tafisr-ibn-kathir' },
    defaultWbwLanguage: { isoCode: 'en' },
    ayahReflectionsLanguages: [{ isoCode: 'en' }],
  };
}

const MOCK_LOGIN_USER = {
  success: true,
  user: {
    id: 'ebd161f7-9301-4f78-baae-1100fba00e07',
    email: 'osama+500@quran.com',
    firstName: 'Eleanor',
    lastName: 'Gilliam',
    photoUrl: null,
    lastSyncAt: '2025-07-12T15:25:57.456Z',
    lastActiveAt: '2025-07-12T17:05:22.860Z',
    lastMutationAt: '2025-07-12T16:42:11.675Z',
    timezone: 'Africa/Cairo',
    registrationSource: 'Quran.com_web',
    username: 'lomev',
    isAdmin: false,
    isBanned: false,
    createdAt: '2025-07-12T08:03:11.494Z',
    features: null,
    consents: {},
  },
};

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const createCookie = (name, value, { path = '/', sameSite = 'lax', httpOnly = false } = {}) => {
  const expires = new Date(Date.now() + ONE_MONTH_MS).toUTCString();

  const parts = [`${name}=${value}`, `path=${path}`, `expires=${expires}`];

  if (sameSite) {
    parts.push(`samesite=${sameSite.toLowerCase()}`);
  }

  if (httpOnly) {
    parts.push('httponly');
  }

  return parts.join('; ');
};

const AT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYmQxNjFmNy05MzAxLTRmNzgtYmFhZS0xMTAwZmJhMDBlMDciLCJhcyI6IkVNTCIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NTIzNDkzMTMsImV4cCI6MTc1MjM1MTExM30.MlDmz4CMqyDdkMDWbjCUhg2RLAfAdAQThgLGTXqf0qM';
const RT_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYmQxNjFmNy05MzAxLTRmNzgtYmFhZS0xMTAwZmJhMDBlMDciLCJhcyI6IkVNTCIsImlzQWRtaW4iOmZhbHNlLCJqdGkiOiJhODVkNGVkZi01ZGRiLTQ4N2ItYWI2MS1hY2Y1ODg5YjMwZjQiLCJpYXQiOjE3NTIzNDkzMTMsImV4cCI6MTc1NDk0MTMxM30.rCbOXjW7tjX_jZeb3GNhn5cQnm5vTVzswXqh4uUpoPw';
const NOTIF_SUB_ID =
  '5910f6d161eb60f8828d54175c1cbb3863fcb7f422350c897fe599bb91878ad5';

const buildAuthCookies = (userId) => {
  const suffix = getEnvSuffix();
  return [
    createCookie(`at${suffix}`, AT_TOKEN, { httpOnly: true }),
    createCookie(`rt${suffix}`, RT_TOKEN, { httpOnly: true }),
    createCookie(`id${suffix}`, userId),
    createCookie(`notif_sub_id${suffix}`, NOTIF_SUB_ID),
  ];
};

// Helper function to create the login response
function createLoginResponse(payload) {
  const response = new HttpResponse(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const userId = payload?.user?.id || MOCK_LOGIN_USER.user.id;
  const cookies = buildAuthCookies(userId);
  cookies.forEach((cookie) => response.headers.append('Set-Cookie', cookie));

  return response;
}

// Define handlers for MSW
const handlers = [
  // Handler for country language preference API - flexible pattern matching
  http.get('*/resources/country_language_preference', ({ request }) => {
    const url = new URL(request.url);
    const userDeviceLanguage = url.searchParams.get('user_device_language');
    const country = url.searchParams.get('country');

    console.log('MSW: Intercepted request URL:', request.url);
    console.log('MSW: Intercepted request for:', { userDeviceLanguage, country });

    // Check for error scenarios
    const errorScenarios = getTestData('errorScenarios');
    const errorResponse = handleCountryLanguagePreferenceErrors(errorScenarios);
    if (errorResponse) {
      return errorResponse;
    }

    // Check for test-specific data first
    const customData = getTestData('countryLanguagePreference');
    if (customData) {
      console.log('MSW: Returning test-specific data:', customData);
      return HttpResponse.json(customData);
    }

    // Fall back to default mock data
    const mockData = getCountryLanguagePreferenceMockData(userDeviceLanguage, country);
    console.log('MSW: Returning default data:', mockData);
    return HttpResponse.json(mockData);
  }),

  // Handler for Learning Plans / Courses (homepage SSR + client fetch).
  http.get('*/auth/courses', () => {
    return HttpResponse.json({ data: [] });
  }),

  // Handler for Pages Lookup (QuranReader).
  http.get('*/pages/lookup', ({ request }) => {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const chapterNumber = url.searchParams.get('chapter_number') || url.searchParams.get('chapter');

    const fallbackChapter = chapterNumber && /^\d+$/.test(chapterNumber) ? chapterNumber : '1';
    const defaultToVerse = fallbackChapter === '1' ? 7 : 1;

    const fromKey = from || `${fallbackChapter}:1`;
    const toKey = to || `${fallbackChapter}:${defaultToVerse}`;

    return HttpResponse.json({
      lookup_range: { from: fromKey, to: toKey },
      pages: {
        1: { from: fromKey, to: toKey },
      },
      total_page: 1,
    });
  }),

  // Handler for Verses by Chapter (SSR + client revalidation).
  http.get('*/verses/by_chapter/:chapterId', ({ params, request }) => {
    const url = new URL(request.url);
    const chapterId = String(params.chapterId || '1');

    const fromKey = url.searchParams.get('from');
    const toKey = url.searchParams.get('to');
    const fromParsed = parseVerseKey(fromKey);
    const toParsed = parseVerseKey(toKey);

    let fromVerse = fromParsed?.chapterId === chapterId ? fromParsed.verseNumber : 1;
    let toVerse = toParsed?.chapterId === chapterId ? toParsed.verseNumber : fromVerse;
    if (toVerse < fromVerse) [fromVerse, toVerse] = [toVerse, fromVerse];

    const rawTranslations = url.searchParams.get('translations') || '';
    const translationIds = rawTranslations
      .split(',')
      .map((t) => Number(String(t).trim()))
      .filter((n) => Number.isFinite(n) && n > 0);

    const MAX_VERSES = 10;
    const count = Math.max(1, Math.min(MAX_VERSES, toVerse - fromVerse + 1));
    const verses = Array.from({ length: count }, (_, idx) =>
      buildMockVerse({ chapterId, verseNumber: fromVerse + idx, translationIds }),
    );

    return HttpResponse.json({
      pagination: {
        per_page: count,
        current_page: 1,
        next_page: null,
        total_records: count,
        total_pages: 1,
      },
      verses,
    });
  }),

  // Handler for auth endpoints
  http.post('*/auth/users/signup', async ({ request }) => {
    const requestBody = await request.json();
    if (requestBody.verificationCode) {
      const baseUser = MOCK_LOGIN_USER.user;
      const email = requestBody.email || baseUser.email;
      const userId = requestBody.email ? `signup-${requestBody.email}` : baseUser.id;
      const loginPayload = {
        success: true,
        user: {
          ...baseUser,
          id: userId,
          email,
        },
      };

      const pendingPrefs = getTestData('pendingSignupPreferences');
      if (pendingPrefs) {
        preferencesByUser.set(userId, pendingPrefs);
      }

      // User has submitted verification code, so we log them in
      return createLoginResponse(loginPayload);
    }
    // Initial signup request before verification
    return HttpResponse.json({
      success: true,
      message: 'Verification code sent',
    });
  }),

  http.post('*/auth/users/login', () => {
    const customLoginResponse = getTestData('loginResponse');
    if (customLoginResponse) {
      console.log('MSW: Returning custom login response:', customLoginResponse);
      if (customLoginResponse?.user?.id && getTestData('preferences') !== null) {
        preferencesByUser.set(customLoginResponse.user.id, getTestData('preferences'));
      }
      return createLoginResponse(customLoginResponse);
    }
    if (getTestData('preferences') !== null) {
      preferencesByUser.set(MOCK_LOGIN_USER.user.id, getTestData('preferences'));
    }
    return createLoginResponse(MOCK_LOGIN_USER);
  }),

  // Handler for getting user preferences (UserPreferencesResponse format)
  http.get('*/auth/preferences', ({ request }) => {
    const userId = getUserIdFromRequest(request);
    if (userId && preferencesByUser.has(userId)) {
      const stored = preferencesByUser.get(userId);
      console.log('MSW: Returning stored preferences for user:', userId);
      return HttpResponse.json(stored);
    }

    const customPreferences = getTestData('preferences');
    if (customPreferences !== null) {
      console.log('MSW: Returning custom preferences:', customPreferences);
      return HttpResponse.json(customPreferences);
    }

    // Default preferences structure matching UserPreferencesResponse
    const defaultPreferences = {
      language: { language: 'en' },
      theme: { type: 'auto' },
      audio: {
        reciter: { id: 7, name: 'Mishari Rashid al-`Afasy' },
        playbackRate: 1,
        showTooltipWhenPlayingAudio: true,
        enableAutoScrolling: true,
      },
      translations: { selectedTranslations: [131] },
      tafsirs: { selectedTafsirs: ['en-tafisr-ibn-kathir'] },
      reading: { selectedWordByWordLocale: 'en' },
      quranReaderStyles: {
        quranFont: 'code_v1',
        mushafLines: 'code_v1',
        quranTextFontSize: 3,
        translationFontSize: 3,
      },
    };

    console.log('MSW: Returning default preferences:', defaultPreferences);
    return HttpResponse.json(defaultPreferences);
  }),

  // Handler for updating user preferences
  http.post('*/api/proxy/auth/preferences', async ({ request }) => {
    const requestBody = await request.json();
    console.log('MSW: Intercepted preference update request with body:', requestBody);

    // Check for error scenarios
    const errorScenarios = getTestData('errorScenarios');
    if (errorScenarios && errorScenarios.preferences) {
      return HttpResponse.json(
        { error: { message: 'Preference update failed' }, success: false },
        { status: 400 },
      );
    }

    const userId = getUserIdFromRequest(request);
    if (userId) {
      preferencesByUser.set(userId, requestBody);
    }

    return HttpResponse.json({ success: true });
  }),

  // Handler for reflections API
  http.get('*/verses/:verseKey/reflections', ({ params }) => {
    const { verseKey } = params;
    console.log('MSW: Intercepted reflections request for verse:', verseKey);

    const customReflections = getTestData('reflections');
    if (customReflections) {
      console.log('MSW: Returning custom reflections:', customReflections);
      return HttpResponse.json(customReflections);
    }

    // Default reflections
    return HttpResponse.json({
      reflections: [
        { id: 1, text: 'English reflection', language: 'en' },
        { id: 2, text: 'تأمل عربي', language: 'ar' },
        { id: 3, text: 'اردو تأمل', language: 'ur' },
        { id: 4, text: 'French reflection', language: 'fr' },
      ],
    });
  }),
];

module.exports = {
  handlers,
  mockCountryLanguagePreferences,
  setTestData,
  getTestData,
  clearTestData,
};
