/**
 * The top -131.6px was calculated based on:
 *
 * 1. the height of emptySpacePlaceholder of navbar (3.6rem).
 * 2. the top padding of the QuranReader container (2rem).
 * 3. the top and bottom margin of the ReadingPreferenceSwitcher container (1.625rem).
 * 4. the top margin of the TranslationView container (1rem).
 *
 * and the total is 8.225rem around 131.6 pixels.
 */
const DEFAULT_ROOT_MARGIN = '-131.6px 0px -68% 0px';
const OBSERVER_THRESHOLD = 0.1;
export const QURAN_READER_OBSERVER_ID = 'quranReaderObserver';
export const REFLECTIONS_OBSERVER_ID = 'reflectionsObserver';
/**
 * the top -115.6px was calculated based on:
 *
 * 1. the height of emptySpacePlaceholder of navbar (3.6rem).
 * 2. the top padding of the QuranReader container (2rem).
 * 3. the top and bottom margin of the ReadingPreferenceSwitcher container (1.625rem).
 *
 * and the total is 7.225rem around 115.6 pixels.
 */
const READING_MODE_ROOT_MARGIN = '-115.6px 0px -70% 0px';

/**
 * Get the observer options based on the reading preference.
 *
 * @param {boolean} isReadingPreference
 * @returns {{rootMargin: string, threshold: number | number[]}}
 */
export const getOptions = (
  isReadingPreference: boolean,
): { rootMargin: string; threshold: number | number[] } => ({
  rootMargin: isReadingPreference ? READING_MODE_ROOT_MARGIN : DEFAULT_ROOT_MARGIN,
  threshold: OBSERVER_THRESHOLD,
});

/**
 * Get the payload that will be dispatched to Redux to set the last read verse.
 *
 * @param {Element} element
 * @returns {{verseKey: string,chapterId: string,page: string,hizb: string}}
 */
export const getObservedVersePayload = (
  element: Element,
): { verseKey: string; chapterId: string; page: string; hizb: string } => ({
  verseKey: element.getAttribute('data-verse-key'),
  chapterId: element.getAttribute('data-chapter-id'),
  page: element.getAttribute('data-page'),
  hizb: element.getAttribute('data-hizb'),
});
