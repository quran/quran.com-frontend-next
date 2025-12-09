# Intelligent Default-Settings & Localisation Bootstrap

## 1. User Story
As a **visitor** (logged-in user or guest) I want Quran.com (QDC) to open with Mushaf style, Translation, Tafsir, word-by-word language, Reciter and Reflections language pre-selected according to my device language and country so that the interface and content feel familiar and immediately understandable.

## 2. Acceptance Criteria
1. **Country & device-language detection**
   – On first request, the server determines the visitor's country from the `CF-IPCountry` request header (populated by Cloudflare) and reads the `Accept-Language` header (fallback to `navigator.language` on the client).
   – Detected `countryCode` and `languageCode` are stored in Redux state.
2. **First-time guests**
   A. If device language = **"en"** → load settings from the mapping row **English + {country}**.
   B. Else if device language ∈ *SupportedLanguages* → load settings from **{language} + ANY** (ignore country).
   C. Else → load settings from **English + {country}**.
   – The resolved settings object is written to Redux (persisted with `redux-persist`).
3. **Logged-in users**
   – On sign-up, the guest's current settings are saved to the DB.
   – On login, settings from the DB hydrate Redux (fallback to guest logic if none exist).
4. **Reset Settings**
   – Triggers the same flow as "first-time guest" using fresh detection values.
5. **Changing site language via world-icon selector**
   – If the user previously modified *any* of the six preferences, only localisation changes; preferences stay the same.
   – Otherwise:
     * If selected language = **"en"** → use **English + {country}** row.
     * Else if selected language ∈ *SupportedLanguages* → use **{selected-language} + ANY** row.
   – Redux (and DB for logged-in users) are updated accordingly.
6. **Reflections list**
   – Languages shown in the reflections list must match the `reflectionLangs[]` of the active setting preset.
7. **SSR compatibility**
   – All detection & default selection must complete during SSR so the first HTML payload is localised correctly.

### SupportedLanguages
`en, ar, bn, fa, fr, id, it, nl, pt, ru, sq, th, tr, ur, zh, ms`

## 3. Definition of Done
* End-to-end Cypress test covers every branch of the decision tree.
* Unit tests for the selector mapping `(country, language) → settings`.
* No TypeScript errors; all Redux slices type-safe.
* No Lighthouse performance regression.
* PR follows project coding guidelines and passes CI.

## 4. Task Checklist (pickable by AI agents)
- [ ] **T1 – Locale Detection Service**: Integrate `detectUserLanguageAndCountry()` from `src/utils/serverSideLanguageDetection.ts` into the `withSsrRedux` HOC to fetch the `{ countryCode, languageCode }` on the server-side for every page.
- [ ] **T2 – Extend Default Settings Slice & Customisation Flag**: Enhance the existing `defaultSettingsSlice` (`src/redux/slices/defaultSettings.ts`) to manage localization settings.
  * Add `{ detectedCountry: string, detectedLanguage: string, userHasCustomised: boolean }` to the slice's state.
  * Create a new thunk `setDefaultsFromCountryPreference(pref)` that accepts the country preference payload and updates the settings in the slice (e.g., `setTranslations`, `setSelectedTafsir`, etc.).
  * Create a `setUserHasCustomised(hasCustomised: boolean)` action. Dispatch this action with `true` in all reducers that modify user preferences (e.g., when a user changes the selected translation, reciter, etc.).
- [ ] **T3 – SSR Integration**: In `withSsrRedux`, after detecting the locale, if the user is a guest and has no persisted settings, call `getCountryLanguagePreference(languageCode, countryCode)` and dispatch `setDefaultsFromCountryPreference` to populate the Redux store on the server.
- [ ] **T4 – Auth Integration**:
  * On **sign-up**: Ensure the current Redux settings are passed to the `persistDefaultSettings` API call.
  * On **login**: When hydrating the user's settings from the backend, if no settings are found, trigger the locale detection and default settings flow as you would for a new guest.
- [ ] **T5 – Language Selector Logic**: In the language selector component (`src/components/Navbar/SettingsDrawer/LanguageSelector.tsx`):
  * When a user selects a new language, check the `userHasCustomised` flag from the Redux store.
  * If `userHasCustomised` is **false**, call `getCountryLanguagePreference(newLanguage, country)` and dispatch `setDefaultsFromCountryPreference` with the new settings.
  * If `userHasCustomised` is **true**, only change the application's locale without altering the user's saved preferences.
- [ ] **T6 – Reset Settings Action**:
  * Add a "Reset to defaults" button in the main settings drawer (`src/components/Navbar/SettingsDrawer/index.tsx`).
  * When clicked, this button should dispatch a new thunk `resetDefaultSettings`. This thunk will re-run the initial locale detection (`detectUserLanguageAndCountry`), fetch the corresponding default settings using `getCountryLanguagePreference`, and update the Redux state by dispatching `setDefaultsFromCountryPreference`. It should also reset the `userHasCustomised` flag to `false`.
- [ ] **T7 – Reflections Query Update**: Modify `getReflections` in `src/utils/quranReflect/locale.ts`.
  * The function should retrieve the `reflectionLanguages` array from the Redux state instead of the hardcoded locale.
  * This array should then be used to construct the API call for fetching reflections, ensuring the list matches the user's default language preset.

> **Note for Agents:** Tasks are largely independent; feel free to self-assign. T1 (locale detection) should be completed first as other tasks depend on it. Settings presets are fetched dynamically via the existing `getCountryLanguagePreference` API. Leverage the existing `defaultSettingsSlice` and `persistDefaultSettings` infrastructure rather than creating new Redux patterns.

---
Generated on {{DATE}}
