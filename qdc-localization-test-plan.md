# Comprehensive Test Plan for QDC Intelligent Localization & Default Settings

## Test Environment Setup

### Prerequisites
- Test environment with QDC application deployed
- Access to browser developer tools for header manipulation
- VPN or proxy tools to simulate different IP countries
- Multiple browser profiles for clean testing
- Database access to verify user settings persistence

### Supported Languages
**Available QDC Languages:** English (en), العربية (ar), বাংলা (bn), فارسی (fa), Français (fr), Indonesia (id), Italiano (it), Dutch (nl), Português (pt), русский (ru), Shqip (sq), ภาษาไทย (th), Türkçe (tr), اردو (ur), 简体中文 (zh), Melayu (ms)

## Test Categories

---

## **Category 1: First-time Guest User Detection & Settings**

### Test Case 1.1: English Device Language + Various Countries
**Objective:** Test English language detection with different country scenarios

#### Sub-test 1.1.1: English Device Language + US Country
**Steps:**
1. Clear all browser data/cookies
2. Set browser language to "en-US"
3. Use VPN/proxy to simulate US IP address
4. Navigate to QDC homepage
5. Inspect Redux state in browser dev tools

**Expected Results:**
- Redux state should show `detectedLanguage: "en"` and `detectedCountry: "US"`
- Settings should load from "English + US" mapping
- Verify all 6 settings: Mushaf style, Translation, Tafsir, Word-by-word language, Reciter, Reflections language
- `userHasCustomised: false` in Redux state

#### Sub-test 1.1.2: English Device Language + Non-US Country (e.g., UK)
**Steps:**
1. Clear all browser data/cookies
2. Set browser language to "en-GB"
3. Use VPN/proxy to simulate UK IP address
4. Navigate to QDC homepage
5. Inspect Redux state and verify settings

**Expected Results:**
- Redux state should show `detectedLanguage: "en"` and `detectedCountry: "GB"`
- Settings should load from "English + GB" mapping (if exists) or fallback
- All 6 settings should be applied based on country preference data

#### Sub-test 1.1.3: English Device Language + Multiple Countries
**Repeat the above test for:**
- Canada (CA)
- Australia (AU)
- India (IN)
- Saudi Arabia (SA)
- Egypt (EG)

**Validation for each:**
- Verify API call to `/resources/country_language_preference?userDeviceLanguage=en&country=[COUNTRY_CODE]`
- Check that appropriate country-specific settings are applied
- Confirm Redux persistence

### Test Case 1.2: Supported Non-English Device Language (Country Ignored)
**Objective:** Test supported non-English languages where country is ignored

#### Sub-test 1.2.1: Arabic Device Language + Any Country
**Steps:**
1. Clear all browser data/cookies
2. Set browser language to "ar-SA"
3. Use VPN to simulate different countries (US, EG, SA, etc.)
4. Navigate to QDC homepage
5. Verify settings for each country

**Expected Results:**
- `detectedLanguage: "ar"` regardless of country
- `detectedCountry` should be "US" (default) for API calls
- Settings load from "Arabic + ANY" mapping
- Country should be ignored for Arabic users

#### Sub-test 1.2.2: Test All Supported Non-English Languages
**Repeat for each supported language:**
- Bengali (bn-BD, bn-IN)
- Persian (fa-IR)
- French (fr-FR, fr-CA)
- Indonesian (id-ID)
- Italian (it-IT)
- Dutch (nl-NL)
- Portuguese (pt-BR, pt-PT)
- Russian (ru-RU)
- Albanian (sq-AL)
- Thai (th-TH)
- Turkish (tr-TR)
- Urdu (ur-PK)
- Chinese (zh-CN)
- Malay (ms-MY)

**Validation for each:**
- Verify API calls use language code + "US" country
- Confirm language-specific defaults are applied
- Test with multiple country IPs to ensure country is ignored

### Test Case 1.3: Unsupported Device Language + Country Detection
**Objective:** Test unsupported languages that fall back to English + Country

#### Sub-test 1.3.1: Japanese Device Language + Japan Country
**Steps:**
1. Clear all browser data/cookies
2. Set browser language to "ja-JP"
3. Use VPN to simulate Japan IP
4. Navigate to QDC homepage

**Expected Results:**
- `detectedLanguage: "en"` (fallback)
- `detectedCountry: "JP"` (preserved from IP)
- Settings load from "English + JP" mapping
- System treats as English user in Japan

#### Sub-test 1.3.2: Test Multiple Unsupported Languages
**Test with:**
- Japanese (ja-JP)
- Korean (ko-KR)
- German (de-DE)
- Spanish (es-ES) - if not supported
- Hebrew (he-IL)
- Hindi (hi-IN)

**Validation:**
- All should fallback to English language
- Country should be preserved from IP detection
- Appropriate country-based English settings applied

---

## **Category 2: User Authentication & Settings Persistence**

### Test Case 2.1: Guest to Registered User Flow
**Objective:** Test signup flow preserves guest settings

#### Sub-test 2.1.1: Guest Settings Preservation on Signup
**Steps:**
1. Start as guest with detected settings (e.g., Arabic + US)
2. Verify initial settings in Redux
3. Complete user registration/signup
4. After successful signup, check settings persistence

**Expected Results:**
- Guest settings should be saved to database on signup
- Post-signup settings should match pre-signup settings
- `userHasCustomised: false` should be maintained

#### Sub-test 2.1.2: Modified Guest Settings on Signup
**Steps:**
1. Start as guest with detected settings
2. Manually change 2-3 settings (translation, reciter, etc.)
3. Complete user registration
4. Verify customized settings are saved

**Expected Results:**
- Modified settings should be preserved and saved to DB
- `userHasCustomised: true` should be saved
- Custom settings should load on future logins

### Test Case 2.2: Returning User Login Flow
**Objective:** Test user settings loading on login

#### Sub-test 2.2.1: User with Saved Settings Login
**Steps:**
1. Login with user who has previously saved settings
2. Verify settings load from database
3. Check Redux state matches saved preferences

**Expected Results:**
- User's saved settings should override default detection
- Redux should be hydrated with database settings
- `userHasCustomised` flag should reflect user's history

#### Sub-test 2.2.2: User with No Saved Settings Login
**Steps:**
1. Login with user who has no saved settings
2. Verify locale detection runs
3. Check appropriate defaults are applied

**Expected Results:**
- System should run fresh locale detection
- Default settings based on current detection should apply
- Settings should be saved to database

---

## **Category 3: Language Selector Behavior**

### Test Case 3.1: Language Change with Unmodified Settings
**Objective:** Test language switching when user hasn't customized settings

#### Sub-test 3.1.1: Switch to English (Country-based)
**Steps:**
1. Start with non-English detected language (e.g., Arabic)
2. Verify `userHasCustomised: false`
3. Click world icon and select "English"
4. Verify new settings application

**Expected Results:**
- Settings should change to "English + [detected country]"
- Redux should update with new language settings
- `userHasCustomised` should remain `false`
- For logged-in users: settings saved to DB

#### Sub-test 3.1.2: Switch to Supported Non-English Language
**Steps:**
1. Start with English detected language + US country
2. Click world icon and select "العربية" (Arabic)
3. Verify settings change

**Expected Results:**
- Settings should change to "Arabic + ANY" (country ignored)
- Language-specific defaults should apply
- `userHasCustomised` should remain `false`

### Test Case 3.2: Language Change with Modified Settings
**Objective:** Test language switching preserves user customizations

#### Sub-test 3.2.1: Language Change Preserves Customizations
**Steps:**
1. Start with default settings
2. Manually change translation and reciter settings
3. Verify `userHasCustomised: true`
4. Change site language via world icon
5. Verify settings preservation

**Expected Results:**
- Site localization should change
- User's custom translation/reciter settings should be preserved
- Only UI language should change, not user preferences
- `userHasCustomised` should remain `true`

---

## **Category 4: Reset Settings Functionality**

### Test Case 4.1: Settings Reset for Guest Users
**Objective:** Test reset button re-applies detection logic

**Steps:**
1. Start as guest with initial settings
2. Modify several settings manually
3. Click "Reset to defaults" button
4. Verify fresh detection and settings application

**Expected Results:**
- Fresh locale detection should run
- New default settings should be applied based on current detection
- Redux should update with fresh defaults
- `userHasCustomised` should be set to `false`

### Test Case 4.2: Settings Reset for Logged-in Users
**Objective:** Test reset saves new defaults to database

**Steps:**
1. Login with user having custom settings
2. Click "Reset to defaults" button
3. Verify database persistence of reset

**Expected Results:**
- Fresh detection and defaults application
- New settings should be saved to database
- `userHasCustomised` should be set to `false`
- Future logins should use the reset defaults

---

## **Category 5: Reflections Language Integration**

### Test Case 5.1: Reflections List Language Matching
**Objective:** Test reflections list matches country preference languages

**Steps:**
1. Set up user with country preference containing specific reflection languages
2. Navigate to any verse with reflections
3. Open ayah-level reflections list
4. Verify languages shown match preset

**Expected Results:**
- Reflections list should only show languages from `ayahReflectionsLanguages` array
- English should always be included as default
- No extra languages should appear in the list

---

## **Category 6: Error Handling & Edge Cases**

### Test Case 6.1: API Failure Scenarios
**Objective:** Test graceful degradation when country preference API fails

#### Sub-test 6.1.1: Network Failure During Detection
**Steps:**
1. Block network access to country preference API
2. Navigate to QDC homepage
3. Verify fallback behavior

**Expected Results:**
- Page should still load successfully
- Fallback to locale-based defaults
- No user-facing errors
- Graceful degradation

#### Sub-test 6.1.2: Invalid Country/Language Combinations
**Steps:**
1. Simulate API returning error for language/country combination
2. Verify system fallback

**Expected Results:**
- System should fall back to default behavior
- User experience should not be disrupted

### Test Case 6.2: Browser Edge Cases
**Objective:** Test unusual browser configurations

#### Sub-test 6.2.1: Missing Accept-Language Header
**Steps:**
1. Configure browser to not send Accept-Language header
2. Navigate to QDC homepage

**Expected Results:**
- Should fallback to English (en)
- Should use IP-based country detection

#### Sub-test 6.2.2: Malformed Language Headers
**Steps:**
1. Set malformed Accept-Language header values
2. Test various malformed formats

**Expected Results:**
- Should gracefully parse or fallback to defaults
- No application crashes or errors

---

## **Category 7: Cross-Device & Session Testing**

### Test Case 7.1: Multi-Device Consistency
**Objective:** Test settings sync across devices for logged-in users

**Steps:**
1. Login and set preferences on Device A
2. Login with same account on Device B
3. Verify settings synchronization

**Expected Results:**
- Settings should sync across devices
- Most recent changes should take precedence
- Consistent user experience

### Test Case 7.2: Session Persistence
**Objective:** Test settings persistence across browser sessions

**Steps:**
1. Set settings as guest user
2. Close and reopen browser
3. Verify settings persistence via redux-persist

**Expected Results:**
- Guest settings should persist via local storage
- Redux should rehydrate correctly

---

## **Category 8: Performance & Load Testing**

### Test Case 8.1: Concurrent User Detection
**Objective:** Test system performance with multiple simultaneous users

**Steps:**
1. Simulate multiple users from different countries accessing simultaneously
2. Monitor API response times and system performance

**Expected Results:**
- API should handle concurrent requests efficiently
- No significant performance degradation
- Response times should remain acceptable

---

## **Test Data Requirements**

### Country-Language Preference Data
Ensure test environment has comprehensive data for:
- All supported language + country combinations
- Edge cases with minimal preference data
- Various Mushaf, Translation, Tafsir, and Reciter options

### Test User Accounts
Create test accounts with:
- Various saved preference combinations
- Accounts with no saved preferences
- Accounts with partial preference data

---

## **Validation Criteria**

### For Each Test Case, Verify:
1. **Redux State Consistency**: All state changes should be properly tracked
2. **API Call Accuracy**: Correct parameters sent to country preference API
3. **Settings Application**: All 6 setting types correctly applied
4. **Persistence**: Appropriate saving to localStorage (guests) or database (users)
5. **User Experience**: No loading delays or visible errors
6. **Flag Management**: Correct tracking of `userHasCustomised` and `isUsingDefaultSettings`

### Success Metrics:
- ✅ All detection logic paths covered
- ✅ Settings correctly applied for each scenario
- ✅ Proper persistence mechanisms working
- ✅ Graceful error handling verified
- ✅ User experience remains smooth throughout

---

## **Testing Tools & Automation**

### Recommended Testing Tools:
- **Playwright**: For end-to-end user flow testing (✅ IMPLEMENTED)
- **Jest/RTL**: For unit testing detection logic
- **Browser DevTools**: For Redux state inspection
- **VPN Services**: For IP geolocation simulation
- **Postman/API Testing**: For API endpoint validation

### Automation Implementation:
- ✅ **Playwright Test Suite**: Comprehensive test coverage implemented in `tests/integration/localization/qdc-localization.spec.ts`
- ✅ **Test Runner Script**: Convenient execution via `scripts/run-localization-tests.js`
- ✅ **API Response Mocking**: All external APIs mocked for consistent testing
- ✅ **Redux State Assertions**: Complete state verification implemented
- ✅ **Cross-browser Testing**: Chromium, Firefox, and WebKit support
- ✅ **Error Handling**: Graceful degradation scenarios covered

### Quick Start:
```bash
# Run all localization tests
node scripts/run-localization-tests.js

# Run specific category
node scripts/run-localization-tests.js --category 1

# Run with debug mode
node scripts/run-localization-tests.js --debug

# Generate HTML report
node scripts/run-localization-tests.js --report
```

This comprehensive test plan ensures thorough coverage of the QDC intelligent localization system, validating every user journey and edge case described in the requirements.
