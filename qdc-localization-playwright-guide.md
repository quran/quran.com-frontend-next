# QDC Localization Testing with Playwright

This guide demonstrates how to execute the comprehensive QDC localization test suite using Playwright, based on the test plan documented in `qdc-localization-test-plan.md`.

## Overview

The QDC project already has a fully implemented Playwright test suite for localization testing located at:
```
tests/integration/localization/qdc-localization.spec.ts
```

This test suite covers:
- ✅ **Category 1**: First-time Guest User Detection & Settings
- ✅ **Category 3**: Language Selector Behavior
- ✅ **Category 4**: Reset Settings Functionality
- ✅ **Category 6**: Error Handling & Edge Cases
- ✅ **Category 7**: Session Persistence

## Prerequisites

1. **Node.js and Dependencies**:
   ```bash
   npm install
   ```

2. **Playwright Installation**:
   ```bash
   npx playwright install
   ```

3. **Test Environment**:
   - Ensure the application is running locally on `http://localhost:3000`
   - Or set `PLAYWRIGHT_TEST_BASE_URL` environment variable

## Running the Tests

### Execute All Localization Tests
```bash
npm run test:integration -- tests/integration/localization/
```

### Execute Specific Test Categories
```bash
# Category 1: First-time Guest User Detection
npx playwright test --grep "Category 1"

# Category 3: Language Selector Behavior
npx playwright test --grep "Category 3"

# Category 4: Reset Settings Functionality
npx playwright test --grep "Category 4"

# Category 6: Error Handling & Edge Cases
npx playwright test --grep "Category 6"

# Category 7: Session Persistence
npx playwright test --grep "Category 7"
```

### Execute Specific Test Cases
```bash
# Test Case 1.1.1: English + US Country
npx playwright test --grep "Test Case 1.1.1"

# Test Case 1.2.1: Arabic Language (Country Ignored)
npx playwright test --grep "Test Case 1.2.1"

# Test Case 3.1.1: Language Change with Unmodified Settings
npx playwright test --grep "Test Case 3.1.1"
```

### Run Tests in Different Browsers
```bash
# Run in Chromium (default)
npx playwright test tests/integration/localization/

# Run in Firefox
npx playwright test tests/integration/localization/ --project=firefox

# Run in WebKit (Safari)
npx playwright test tests/integration/localization/ --project=webkit

# Run in all browsers
npx playwright test tests/integration/localization/ --project=chromium --project=firefox --project=webkit
```

### Debug Mode
```bash
# Run with debug mode (opens browser UI)
npx playwright test tests/integration/localization/ --debug

# Run with headed mode (visible browser)
npx playwright test tests/integration/localization/ --headed
```

### Generate Test Reports
```bash
# Run tests and generate HTML report
npx playwright test tests/integration/localization/
npx playwright show-report
```

## Test Architecture

### LocalizationTestHelper Class

The test suite uses a comprehensive helper class that provides:

```typescript
class LocalizationTestHelper {
  // Mock browser language preferences
  async setBrowserLanguage(locales: string[])

  // Mock IP-based country detection
  async mockCountryDetection(countryCode: string)

  // Mock country language preference API responses
  async mockCountryLanguagePreferenceAPI(userDeviceLanguage: string, country: string, mockResponse: any)

  // Verify Redux state structure
  async verifyDefaultSettingsStructure(expectedSettings: {...})

  // Verify all 6 core settings are applied
  async verifyCoreSettingsAreApplied()

  // Clear browser storage for clean test state
  async clearAllBrowserData()

  // Wait for Redux state hydration
  async waitForReduxHydration()
}
```

### Sample Test Structure

```typescript
test('Test Case 1.1.1: English Device Language + US Country', async ({ page, context }) => {
  // 1. Setup: Mock API responses and browser environment
  const mockUSPreferences = {
    country: 'US',
    userDeviceLanguage: 'en',
    defaultMushaf: { id: 1 },
    defaultTranslations: [{ id: 131 }],
    defaultTafsir: { id: 'en-tafisr-ibn-kathir' },
    defaultWbwLanguage: { isoCode: 'en' },
    ayahReflectionsLanguages: [{ isoCode: 'en' }]
  };

  await helper.mockCountryLanguagePreferenceAPI('en', 'US', mockUSPreferences);
  await helper.setBrowserLanguage(['en-US', 'en']);
  await helper.mockCountryDetection('US');

  // 2. Action: Navigate to homepage
  await page.goto('/');
  await helper.waitForReduxHydration();

  // 3. Verification: Check Redux state and settings
  await helper.verifyDefaultSettingsStructure({
    detectedLanguage: 'en',
    detectedCountry: 'US',
    userHasCustomised: false,
    isUsingDefaultSettings: true
  });

  await helper.verifyCoreSettingsAreApplied();
});
```

## Adding New Test Cases

### Example: Add Test Case 1.1.3 (English + Multiple Countries)

```typescript
test('Test Case 1.1.3: English Device Language + Multiple Countries', async ({ page, context }) => {
  const testCountries = ['CA', 'AU', 'IN'];

  for (const country of testCountries) {
    await helper.clearAllBrowserData();

    const mockPreferences = {
      country: country,
      userDeviceLanguage: 'en',
      defaultMushaf: { id: 1 },
      defaultTranslations: [{ id: getCountrySpecificTranslation(country) }],
      defaultTafsir: { id: 'en-tafisr-ibn-kathir' },
      defaultWbwLanguage: { isoCode: 'en' },
      ayahReflectionsLanguages: [{ isoCode: 'en' }]
    };

    await helper.mockCountryLanguagePreferenceAPI('en', country, mockPreferences);
    await helper.setBrowserLanguage(['en-US', 'en']);
    await helper.mockCountryDetection(country);

    await page.goto('/');
    await helper.waitForReduxHydration();

    // Verify API call was made with correct parameters
    const apiCalls = page.context().route.calls;
    expect(apiCalls.some(call =>
      call.url.includes(`userDeviceLanguage=en&country=${country}`)
    )).toBe(true);

    await helper.verifyDefaultSettingsStructure({
      detectedLanguage: 'en',
      detectedCountry: country,
      userHasCustomised: false,
      isUsingDefaultSettings: true
    });
  }
});

function getCountrySpecificTranslation(country: string): number {
  const countryTranslations = {
    'CA': 20,  // Canadian preference
    'AU': 131, // Australian preference
    'IN': 158  // Indian preference
  };
  return countryTranslations[country] || 131;
}
```

### Example: Add Test Case 2.1 (Guest to Registered User Flow)

```typescript
test('Test Case 2.1.1: Guest Settings Preservation on Signup', async ({ page, context }) => {
  // 1. Start as guest with detected settings
  const mockPreferences = {
    country: 'US',
    userDeviceLanguage: 'ar',
    defaultMushaf: { id: 2 },
    defaultTranslations: [{ id: 20 }],
    defaultTafsir: { id: 'ar-tafseer-al-tabari' },
    defaultWbwLanguage: { isoCode: 'ar' },
    ayahReflectionsLanguages: [{ isoCode: 'ar' }]
  };

  await helper.mockCountryLanguagePreferenceAPI('ar', 'US', mockPreferences);
  await helper.setBrowserLanguage(['ar-SA', 'ar']);
  await helper.mockCountryDetection('US');

  await page.goto('/');
  await helper.waitForReduxHydration();

  // 2. Capture guest settings before signup
  const guestSettings = {
    translations: await helper.homepage.getPersistedValue('translations'),
    tafsirs: await helper.homepage.getPersistedValue('tafsirs'),
    readingPreferences: await helper.homepage.getPersistedValue('readingPreferences'),
    defaultSettings: await helper.getReduxState()
  };

  // 3. Mock signup process
  await page.locator('[data-testid="login-button"]').click();
  await page.locator('[data-testid="signup-tab"]').click();

  // Fill signup form
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');

  // Mock successful signup API response
  await page.route('**/auth/signup', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, userId: '12345' })
    });
  });

  await page.locator('[data-testid="signup-submit"]').click();
  await page.waitForNavigation();

  // 4. Verify settings preservation after signup
  const postSignupSettings = {
    translations: await helper.homepage.getPersistedValue('translations'),
    tafsirs: await helper.homepage.getPersistedValue('tafsirs'),
    readingPreferences: await helper.homepage.getPersistedValue('readingPreferences'),
    defaultSettings: await helper.getReduxState()
  };

  // Assert settings are preserved
  expect(postSignupSettings.translations.selectedTranslations)
    .toEqual(guestSettings.translations.selectedTranslations);
  expect(postSignupSettings.defaultSettings.userHasCustomised)
    .toBe(guestSettings.defaultSettings.userHasCustomised);
});
```

### Example: Add Test Case 5.1 (Reflections Language Integration)

```typescript
test('Test Case 5.1: Reflections List Language Matching', async ({ page, context }) => {
  // Setup country preference with specific reflection languages
  const mockPreferences = {
    country: 'US',
    userDeviceLanguage: 'en',
    defaultMushaf: { id: 1 },
    defaultTranslations: [{ id: 131 }],
    defaultTafsir: { id: 'en-tafisr-ibn-kathir' },
    defaultWbwLanguage: { isoCode: 'en' },
    ayahReflectionsLanguages: [
      { isoCode: 'en' },
      { isoCode: 'ar' },
      { isoCode: 'ur' }
    ]
  };

  await helper.mockCountryLanguagePreferenceAPI('en', 'US', mockPreferences);
  await helper.setBrowserLanguage(['en-US', 'en']);
  await helper.mockCountryDetection('US');

  await page.goto('/1/1'); // Navigate to specific verse
  await helper.waitForReduxHydration();

  // Find a verse and open reflections
  await page.locator('[data-testid="verse-container"]').first().hover();
  await page.locator('[data-testid="reflections-button"]').first().click();

  // Verify reflections list shows only preset languages
  await expect(page.locator('[data-testid="reflections-list"]')).toBeVisible();

  const reflectionLanguages = await page.locator('[data-testid="reflection-language-option"]').allTextContents();

  // Should include English, Arabic, and Urdu only
  expect(reflectionLanguages).toContain('English');
  expect(reflectionLanguages).toContain('العربية');
  expect(reflectionLanguages).toContain('اردو');

  // Should not include other languages
  expect(reflectionLanguages).not.toContain('Français');
  expect(reflectionLanguages).not.toContain('Deutsch');
});
```

## Performance and Load Testing

### Example: Add Test Case 8.1 (Concurrent User Detection)

```typescript
test('Test Case 8.1: Concurrent User Detection Performance', async ({ browser }) => {
  const concurrentUsers = 5;
  const pages = [];

  // Create multiple browser contexts to simulate different users
  for (let i = 0; i < concurrentUsers; i++) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const helper = new LocalizationTestHelper(page, context);

    // Setup different language/country combinations
    const testCombination = getTestCombination(i);
    await helper.mockCountryLanguagePreferenceAPI(
      testCombination.language,
      testCombination.country,
      testCombination.mockResponse
    );

    pages.push({ page, helper, testCombination });
  }

  // Measure start time
  const startTime = Date.now();

  // Navigate all pages simultaneously
  const navigationPromises = pages.map(({ page, helper }) =>
    page.goto('/').then(() => helper.waitForReduxHydration())
  );

  await Promise.all(navigationPromises);

  // Measure total time
  const totalTime = Date.now() - startTime;

  // Verify performance is acceptable (adjust threshold as needed)
  expect(totalTime).toBeLessThan(10000); // 10 seconds max for 5 concurrent users

  // Verify all users got correct settings
  for (const { page, helper, testCombination } of pages) {
    await helper.verifyDefaultSettingsStructure({
      detectedLanguage: testCombination.expectedLanguage,
      detectedCountry: testCombination.expectedCountry,
      userHasCustomised: false,
      isUsingDefaultSettings: true
    });
  }

  // Cleanup
  for (const { page } of pages) {
    await page.context().close();
  }
});

function getTestCombination(index: number) {
  const combinations = [
    { language: 'en', country: 'US', expectedLanguage: 'en', expectedCountry: 'US' },
    { language: 'ar', country: 'SA', expectedLanguage: 'ar', expectedCountry: 'US' },
    { language: 'fr', country: 'FR', expectedLanguage: 'fr', expectedCountry: 'US' },
    { language: 'ja', country: 'JP', expectedLanguage: 'en', expectedCountry: 'JP' }, // Fallback
    { language: 'en', country: 'GB', expectedLanguage: 'en', expectedCountry: 'GB' }
  ];

  return {
    ...combinations[index % combinations.length],
    mockResponse: generateMockResponse(combinations[index % combinations.length])
  };
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: QDC Localization Tests

on:
  push:
    branches: [ main, SSR ]
  pull_request:
    branches: [ main ]

jobs:
  localization-tests:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright
      run: npx playwright install --with-deps

    - name: Start application
      run: |
        npm run build
        npm start &
        sleep 30

    - name: Run localization tests
      run: npx playwright test tests/integration/localization/

    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## Best Practices

1. **Test Isolation**: Each test clears browser storage and starts fresh
2. **API Mocking**: All external APIs are mocked for consistent, fast tests
3. **State Verification**: Tests verify both Redux state and UI behavior
4. **Error Handling**: Tests include graceful degradation scenarios
5. **Performance**: Tests include timing assertions for acceptable load times
6. **Cross-browser**: Tests can run on Chromium, Firefox, and WebKit
7. **Parallel Execution**: Tests can run in parallel for faster CI/CD

## Troubleshooting

### Common Issues

1. **Redux Hydration Timeout**:
   ```typescript
   // Increase timeout if needed
   await helper.waitForReduxHydration({ timeout: 15000 });
   ```

2. **API Route Mocking**:
   ```typescript
   // Ensure routes are set before page navigation
   await helper.mockCountryLanguagePreferenceAPI(/* ... */);
   await page.goto('/'); // After mocking
   ```

3. **Test Data Cleanup**:
   ```typescript
   test.afterEach(async ({ page }) => {
     await helper.clearAllBrowserData();
   });
   ```

This comprehensive guide provides everything needed to execute and extend the QDC localization test suite using Playwright!
