import { BrowserContext, Page } from '@playwright/test';

class Homepage {
  readonly page: Page;

  readonly context: BrowserContext;

  /**
   * Construct a new Homepage instance.
   *
   * @param {Page} page
   * @param {BrowserContext} context
   */
  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
  }

  async goTo() {
    await this.page.goto('/');
  }

  /**
   * Access a value from the local storage. An example of the localStorage:
   * [
   * {
   * name: 'persist:commandBar',
   * value: '{"recentNavigations":"[]","_persist":"{\\"version\\":1,\\"rehydrated\\":true}"}'
   * },
   * {
   * name: 'persist:root',
   *value: '{"quranReaderStyles":"{\\"tafsirFontScale\\":3,\\"quranTextFontScale\\":3,\\"translationFontScale\\":3,\\"quranFont\\":\\"code_v1\\",\\"mushafLines\\":\\"16_lines\\",\\"isUsingDefaultFont\\":true}","readingPreferences":"{\\"readingPreference\\":\\"translation\\",\\"showWordByWordTranslation\\":false,\\"selectedWordByWordTranslation\\":20,\\"showWordByWordTransliteration\\":false,\\"selectedWordByWordTransliteration\\":12,\\"selectedWordByWordLocale\\":\\"en\\",\\"isUsingDefaultWordByWordLocale\\":true,\\"showTooltipFor\\":[\\"translation\\"],\\"wordClickFunctionality\\":\\"play-audio\\"}","translations":"{\\"selectedTranslations\\":[131],\\"isUsingDefaultTranslations\\":true}","theme":"{\\"type\\":\\"auto\\"}","tafsirs":"{\\"selectedTafsirs\\":[\\"en-tafisr-ibn-kathir\\"],\\"isUsingDefaultTafsirs\\":true}","bookmarks":"{\\"bookmarkedVerses\\":{}}","search":"{\\"searchHistory\\":[]}","readingTracker":"{\\"lastReadVerse\\":{\\"verseKey\\":null,\\"chapterId\\":null,\\"page\\":null,\\"hizb\\":null},\\"recentReadingSessions\\":{}}","welcomeMessage":"{\\"isVisible\\":true}","defaultSettings":"{\\"isUsingDefaultSettings\\":true}","sidebarNavigation":"{\\"isVisible\\":false,\\"selectedNavigationItem\\":\\"surah\\"}","radio":"{\\"id\\":\\"1\\",\\"type\\":\\"curated\\",\\"chapterId\\":\\"53\\",\\"reciterId\\":\\"3\\"}","banner":"{\\"isBannerVisible\\":true}","_persist":"{\\"version\\":17,\\"rehydrated\\":true}"}'
   * }
   * ]
   *
   * @param {string} name
   * @param {string} storageKey
   * @returns {any|null}
   */
  async getPersistedValue(name: string, storageKey = 'persist:root'): Promise<any | null> {
    // Wait for the page to be fully loaded and React to initialize localStorage
    await this.page.waitForLoadState('networkidle');

    // Wait for React hydration and localStorage to be populated
    await this.page.waitForFunction(
      () => {
        return window.localStorage.getItem('persist:root') !== null;
      },
      { timeout: 10000 },
    );

    const storage = await this.context.storageState();

    const localStorageArray = storage.origins[0].localStorage;
    const persistedRoot = localStorageArray.filter(
      (localStorageObject) => localStorageObject.name === storageKey,
    );

    if (!persistedRoot || persistedRoot.length === 0) {
      return null;
    }
    const parentObject = JSON.parse(persistedRoot[0].value);
    if (!parentObject[name]) {
      return null;
    }
    return JSON.parse(parentObject[name]);
  }

  async openSettingsDrawer() {
    await this.page.getByTestId('settings-button').click();
  }
}

export default Homepage;
