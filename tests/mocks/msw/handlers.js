/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
const { http, HttpResponse } = require('msw');

const { mockCountryLanguagePreferences } = require('../data');

// Test-specific data storage for per-test customization
const testDataStore = {
  preferences: null,
  errorScenarios: {},
  reflections: null,
  loginResponse: null,
  countryLanguagePreference: null,
  verses: null,
  chapter: null,
  notes: null,
  bookmarks: null,
  collections: null,
};

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
  testDataStore.errorScenarios = {};
  testDataStore.reflections = null;
  testDataStore.loginResponse = null;
  testDataStore.countryLanguagePreference = null;
  testDataStore.verses = null;
  testDataStore.chapter = null;
  testDataStore.notes = null;
  testDataStore.bookmarks = null;
  testDataStore.collections = null;
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

const AT_COOKIE = createCookie(
  'at_test',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYmQxNjFmNy05MzAxLTRmNzgtYmFhZS0xMTAwZmJhMDBlMDciLCJhcyI6IkVNTCIsImlzQWRtaW4iOmZhbHNlLCJpYXQiOjE3NTIzNDkzMTMsImV4cCI6MTc1MjM1MTExM30.MlDmz4CMqyDdkMDWbjCUhg2RLAfAdAQThgLGTXqf0qM',
  { httpOnly: true },
);
const RT_COOKIE = createCookie(
  'rt_test',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYmQxNjFmNy05MzAxLTRmNzgtYmFhZS0xMTAwZmJhMDBlMDciLCJhcyI6IkVNTCIsImlzQWRtaW4iOmZhbHNlLCJqdGkiOiJhODVkNGVkZi01ZGRiLTQ4N2ItYWI2MS1hY2Y1ODg5YjMwZjQiLCJpYXQiOjE3NTIzNDkzMTMsImV4cCI6MTc1NDk0MTMxM30.rCbOXjW7tjX_jZeb3GNhn5cQnm5vTVzswXqh4uUpoPw',
  { httpOnly: true },
);
const ID_COOKIE = createCookie('id_test', 'ebd161f7-9301-4f78-baae-1100fba00e07');
const NOTIF_SUB_ID_COOKIE = createCookie(
  'notif_sub_id_test',
  '5910f6d161eb60f8828d54175c1cbb3863fcb7f422350c897fe599bb91878ad5',
);
// Helper function to create the login response
function createLoginResponse() {
  const response = new HttpResponse(JSON.stringify(MOCK_LOGIN_USER), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  response.headers.append('Set-Cookie', AT_COOKIE);
  response.headers.append('Set-Cookie', RT_COOKIE);
  response.headers.append('Set-Cookie', ID_COOKIE);
  response.headers.append('Set-Cookie', NOTIF_SUB_ID_COOKIE);

  return response;
}

// Helper function to create custom login response with test data
function createCustomLoginResponse(customData) {
  const response = new HttpResponse(JSON.stringify(customData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  response.headers.append('Set-Cookie', AT_COOKIE);
  response.headers.append('Set-Cookie', RT_COOKIE);
  response.headers.append('Set-Cookie', ID_COOKIE);
  response.headers.append('Set-Cookie', NOTIF_SUB_ID_COOKIE);

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

  // Handler for auth endpoints
  http.post('*/auth/users/signup', async ({ request }) => {
    const requestBody = await request.json();
    if (requestBody.verificationCode) {
      // User has submitted verification code, so we log them in
      return createLoginResponse();
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
      return createCustomLoginResponse(customLoginResponse);
    }
    return createLoginResponse();
  }),

  // Handler for getting user preferences (UserPreferencesResponse format)
  http.get('*/auth/preferences', () => {
    const customPreferences = getTestData('preferences');
    if (customPreferences) {
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
  // Handler for verses endpoint
  http.get('*/verses', () => {
    const customVerses = getTestData('verses');
    if (customVerses) {
      return HttpResponse.json(customVerses);
    }
    return HttpResponse.json({
      verses: [],
      pagination: { totalRecords: 0, currentPage: 1, nextPage: null },
    });
  }),

  // Handler for chapter endpoint
  http.get('*/chapters/:chapterId', ({ params }) => {
    const customChapter = getTestData('chapter');
    if (customChapter) {
      return HttpResponse.json(customChapter);
    }
    return HttpResponse.json({
      chapter: {
        id: Number(params.chapterId),
        chapterNumber: Number(params.chapterId),
        nameSimple: 'Al-Fatihah',
        nameArabic: 'الفاتحة',
        versesCount: 7,
        revelationPlace: 'makkah',
      },
    });
  }),

  // Handler for translations list
  http.get('*/resources/translations', () => {
    return HttpResponse.json({ translations: [] });
  }),

  // Handler for tafsirs list
  http.get('*/resources/tafsirs', () => {
    return HttpResponse.json({ tafsirs: [] });
  }),

  // Handlers for notes CRUD
  http.get('*/notes', () => {
    const customNotes = getTestData('notes');
    if (customNotes) {
      return HttpResponse.json(customNotes);
    }
    return HttpResponse.json({ notes: [], pagination: { totalRecords: 0 } });
  }),

  http.post('*/notes', () => {
    return HttpResponse.json({ note: { id: 'test-note-1', body: '', verseKey: '1:1' } });
  }),

  http.patch('*/notes/:id', () => {
    return HttpResponse.json({ note: { id: 'test-note-1' } });
  }),

  http.delete('*/notes/:id', () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  // Handlers for bookmarks CRUD
  http.get('*/bookmarks', () => {
    const customBookmarks = getTestData('bookmarks');
    if (customBookmarks) {
      return HttpResponse.json(customBookmarks);
    }
    return HttpResponse.json({ bookmarks: [], pagination: { totalRecords: 0 } });
  }),

  http.post('*/bookmarks', () => {
    return HttpResponse.json({ bookmark: { id: 'test-bookmark-1' } });
  }),

  http.delete('*/bookmarks/:id', () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  // Handlers for collections CRUD
  http.get('*/collections', () => {
    const customCollections = getTestData('collections');
    if (customCollections) {
      return HttpResponse.json(customCollections);
    }
    return HttpResponse.json({ collections: [], pagination: { totalRecords: 0 } });
  }),

  http.post('*/collections', () => {
    return HttpResponse.json({ collection: { id: 'test-collection-1', name: 'Test Collection' } });
  }),

  http.put('*/collections/:id', () => {
    return HttpResponse.json({ collection: { id: 'test-collection-1' } });
  }),

  http.delete('*/collections/:id', () => {
    return HttpResponse.json({}, { status: 200 });
  }),
];

module.exports = {
  handlers,
  mockCountryLanguagePreferences,
  setTestData,
  getTestData,
  clearTestData,
};
