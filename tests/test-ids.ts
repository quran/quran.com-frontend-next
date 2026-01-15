import ThemeType from '@/redux/types/ThemeType';
import { QuranFont } from '@/types/QuranReader';

export enum TestId {
  AUTH_UPDATE_PROFILE_CHANGE_PASSWORD_SECTION = 'auth-update-profile-change-password-section',
  AUTH_UPDATE_PROFILE_CONFIRM_NEW_PASSWORD_INPUT = 'auth-update-profile-confirm-new-password-input',
  AUTH_UPDATE_PROFILE_CURRENT_PASSWORD_INPUT = 'auth-update-profile-current-password-input',
  AUTH_UPDATE_PROFILE_EDIT_DETAILS_SECTION = 'auth-update-profile-edit-details-section',
  AUTH_UPDATE_PROFILE_EMAIL_NOTIFICATION_SETTINGS_CHECKBOX = 'auth-update-profile-email-notification-settings-checkbox',
  AUTH_UPDATE_PROFILE_EMAIL_NOTIFICATION_SETTINGS_SECTION = 'auth-update-profile-email-notification-settings-section',
  AUTH_UPDATE_PROFILE_NEW_PASSWORD_INPUT = 'auth-update-profile-new-password-input',
  AUTH_UPDATE_PROFILE_PERSONALIZATION_SECTION = 'auth-update-profile-personalization-section',
  AUTH_UPDATE_PROFILE_PROFILE_INPUT = 'auth-update-profile-input',
  AUDIO_CLOSE_PLAYER = 'audio-close-player',
  AUDIO_ELAPSED = 'audio-elapsed',
  AUDIO_NEXT_AYAH = 'audio-next-ayah',
  AUDIO_PAUSE_TOGGLE = 'audio-pause-toggle',
  AUDIO_PLAY_TOGGLE = 'audio-play-toggle',
  AUDIO_PLAYER_BODY = 'audio-player-body',
  AUDIO_PREV_AYAH = 'audio-prev-ayah',
  AUTO_BUTTON = 'auto-button',
  AYAH_SELECTION = 'ayah-selection',
  BANNER = 'banner',
  CHANGE_THEME_BUTTON = 'change-theme',
  BISMILLAH_SECTION = 'bismillah-section',
  BOTTOM_ACTION_TAB_TAFSIR = 'bottom-action-tab-tafsir',
  CHAPTER_AND_JUZ_LIST = 'chapter-and-juz-list',
  CHAPTER_BEGINNING_BUTTON = 'chapter-beginning-button',
  CHAPTER_CARD = 'chapter-card',
  CHAPTER_NAVIGATION = 'chapter-navigation',
  CHAPTER_TITLE = 'chapter-title',
  COMMUNITY_SECTION = 'community-section',
  COUNTER = 'counter',
  COUNTER_VALUE = 'counter-value',
  COURSES_LIST = 'courses-list',
  DARK_BUTTON = 'dark-button',
  DECREMENT_BUTTON = 'decrement-button',
  END_OF_SCROLLING_CONTROLS = 'end-of-scrolling-controls',
  EXPLORE_TOPICS_CONTAINER = 'explore-topics-container',
  FOOTNOTE_CONTENT = 'footnote-content',
  FORM_BUILDER_VALIDATION_ERRORS = 'form-builder-validation-errors',
  HEADER = 'header',
  INCREMENT_BUTTON = 'increment-button',
  JUZ_BUTTON = 'juz-button',
  LANG_SELECTION = 'lang-selection',
  LANGUAGE_CONTAINER = 'language-container',
  LANGUAGE_SELECTOR = 'language-selector',
  LANGUAGE_SELECTOR_BUTTON = 'language-selector-button',
  LEARNING_PLAN_BANNER = 'learning-plan-banner',
  LEARNING_PLAN_ENROLL_BUTTON = 'learning-plan-enroll-button',
  LEARNING_PLAN_LESSON_VIEW = 'learning-plan-lesson-view',
  LEARNING_PLANS_SECTION = 'learning-plans-section',
  LESSON_MARK_COMPLETE_BUTTON = 'lesson-mark-complete-button',
  LIGHT_BUTTON = 'light-button',
  LINES = 'lines',
  LISTEN_BUTTON = 'listen-button',
  MODAL_CONTENT = 'modal-content',
  MORE_RESULTS = 'more-results',
  NAVBAR = 'navbar',
  NAVIGATE_QURAN_BUTTON = 'navigate-quran-button',
  NAVIGATION_DRAWER = 'navigation-drawer',
  NAVIGATION_DRAWER_CLOSE_BUTTON = 'drawer-close-button',
  NAVIGATION_DRAWER_BODY = 'navigation-drawer-body',
  NAVIGATION_LINKS_OUR_PROJECTS = 'navigation-links-our-projects',
  NEXT_PAGE_BUTTON = 'next-page-button',
  NEXT_SURAH_BUTTON = 'next-surah-button',
  OPEN_NAVIGATION_DRAWER = 'open-navigation-drawer',
  OPEN_SEARCH_DRAWER = 'open-search-drawer',
  PAGE_BUTTON = 'page-button',
  PAGE_INFO = 'page-info',
  PAGE_NAVIGATION_BUTTONS = 'page-navigation-buttons',
  PASSWORD_VALIDATION = 'password-validation',
  PAUSE_BUTTON = 'pause-button',
  PLAYBACK_RATE_MENU = 'playback-rate-menu',
  POPULAR_BUTTON = 'popular-button',
  POPULAR_SEARCH_SECTION = 'popular-search-section',
  PREVIOUS_SURAH_BUTTON = 'previous-surah-button',
  PROFILE_AVATAR_BUTTON = 'profile-avatar-button',
  PROGRESS_BAR = 'progress-bar',
  QUICK_LINKS = 'quick-links',
  QURAN_IN_A_YEAR_SECTION = 'quran-in-a-year-section',
  READING_BUTTON = 'reading-button',
  READING_TAB = 'reading-tab',
  REPEAT_AUDIO_MODAL = 'repeat-audio-modal',
  SEARCH_DRAWER_CONTAINER = 'search-drawer-container',
  SEARCH_DRAWER_HEADER = 'search-drawer-header',
  SEARCH_RESULTS = 'search-results',
  SETTINGS_BUTTON = 'settings-button',
  SETTINGS_DRAWER = 'settings-drawer',
  SETTINGS_DRAWER_BODY = 'settings-drawer-body',
  SEPIA_BUTTON = 'sepia-button',
  SIDEBAR_NAVIGATION = 'sidebar-navigation',
  SIGNUP_BUTTON = 'signup-button',
  SURAH_INFO_BUTTON = 'surah-info-button',
  SURAH_NAME = 'surah-name',
  SURAH_NUMBER_OF_AYAHS = 'surah-number-of-ayahs',
  SURAH_REVELATION_PLACE = 'surah-revelation-place',
  SYLLABUS_BUTTON = 'syllabus-button',
  TABS_CONTAINER = 'tabs-container',
  TAJWEED_BUTTON = 'tajweed-button',
  TEXT_INDOPAK_BUTTON = 'text_indopak-button',
  TEXT_UTHMANI_BUTTON = 'text_uthmani-button',
  THEME_SWITCHER = 'theme-switcher',
  TRANSLATION_BUTTON = 'translation-button',
  TRANSLATION_SELECT = 'translation-select',
  TRANSLATION_TAB = 'translation-tab',
  TRANSLATION_CARD = 'translation-card',
  VERIFICATION_CODE = 'verification-code',
  VERSE_BUTTON = 'verse-button',
  VERSE_LIST = 'verse-list',
  WBW_TRANSLATION = 'wbw-translation',
  WBW_TRANSLITERATION = 'wbw-transliteration',
  WORD_BY_WORD = 'wbw-language-select',
}

export type SettingsQuranFont = QuranFont.IndoPak | QuranFont.Uthmani | QuranFont.Tajweed;

const THEME_BUTTON_TEST_IDS: Record<ThemeType, TestId> = {
  [ThemeType.Auto]: TestId.AUTO_BUTTON,
  [ThemeType.Light]: TestId.LIGHT_BUTTON,
  [ThemeType.Dark]: TestId.DARK_BUTTON,
  [ThemeType.Sepia]: TestId.SEPIA_BUTTON,
};

const QURAN_FONT_BUTTON_TEST_IDS: Record<SettingsQuranFont, TestId> = {
  [QuranFont.IndoPak]: TestId.TEXT_INDOPAK_BUTTON,
  [QuranFont.Uthmani]: TestId.TEXT_UTHMANI_BUTTON,
  [QuranFont.Tajweed]: TestId.TAJWEED_BUTTON,
};

export const getChapterContainerTestId = (chapterId: number): string =>
  `chapter-${chapterId}-container`;

export const getJuzContainerTestId = (juzNumber: number): string => `juz-${juzNumber}-container`;

export const getLanguageItemTestId = (locale: string): string => `language-item-${locale}`;

export const getSyllabusLessonTestId = (lessonNumber: number): string =>
  `syllabus-lesson-${lessonNumber}`;

export const getTafsirSelectionTestId = (tafsirId: string): string =>
  `tafsir-selection-${tafsirId}`;

export const getVerseArabicTestId = (verseKey: string): string => `verse-arabic-${verseKey}`;

export const getVerseTestId = (verseKey: string): string => `verse-${verseKey}`;

export const getThemeButtonTestId = (theme: ThemeType): TestId => THEME_BUTTON_TEST_IDS[theme];

export const getQuranFontButtonTestId = (font: SettingsQuranFont): TestId =>
  QURAN_FONT_BUTTON_TEST_IDS[font];
