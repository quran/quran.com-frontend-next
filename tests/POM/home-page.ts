import { BrowserContext, Locator, Page } from '@playwright/test';

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

  /**
   * Navigate to a specific path.
   * @param {string} path The path to navigate to, defaults to the homepage ('/')
   */
  async goTo(path: string = '/') {
    await this.page.goto(path, { waitUntil: 'networkidle' });
    await this.hideNextJSOverlay();
  }

  /**
   * Reload the current page.
   */
  async reload() {
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.hideNextJSOverlay();
  }

  /**
   * Hide the Next.js error overlay that may appear on the page.
   * Needed to click on elements behind it.
   */
  async hideNextJSOverlay() {
    await this.page.addStyleTag({
      content: `
      nextjs-portal {
        display: none;
      }
    `,
    });
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

    if (!storage.origins || storage.origins.length === 0) {
      return null;
    }
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

  async enableMushafMode(isMobile: boolean) {
    if (isMobile) {
      // scroll down a little to make the tab visible (bypassing a render issue)
      // FIXME: Remove this workaround when the underlying issue is fixed
      await this.page.mouse.wheel(0, 200);
      await this.page.mouse.wheel(0, -100);

      await this.page.getByTestId('reading-tab').click();
    } else {
      await this.page.getByTestId('reading-button').click();
    }
  }

  /**
   * Search for a query using the search bar and return the search results locator.
   * @param {string} query The search query to fill in the search bar
   * @returns {Promise<Locator>} The search results locator
   */
  async searchFor(query: string): Promise<Locator> {
    const searchBar = this.page.locator('#searchQuery');
    await searchBar.fill(query);
    return this.page.getByTestId('search-results');
  }
}

export default Homepage;
