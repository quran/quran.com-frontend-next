import {
  ReadingPreference,
  WordByWordType,
  WordClickFunctionality,
  WordByWordDisplay,
} from '@/types/QuranReader';

type ReadingPreferences = {
  readingPreference: ReadingPreference;
  selectedWordByWordLocale: string;
  wordByWordContentType: WordByWordType[];
  wordByWordTooltipContentType: WordByWordType[];
  wordByWordInlineContentType: WordByWordType[];
  wordByWordDisplay: WordByWordDisplay[];
  wordClickFunctionality: WordClickFunctionality;
  isUsingDefaultWordByWordLocale: boolean;
  selectedReadingTranslation: string | null;
  lastUsedReadingMode: ReadingPreference.Reading | ReadingPreference.ReadingTranslation;
  selectedReflectionLanguages: string[];
  selectedLessonLanguages: string[];
  /**
   * Sticky flags to track whether the user ever manually changed the tab languages.
   * If true, we should not auto-sync these fields on locale change (even if the
   * current value matches defaults).
   */
  hasCustomizedReflectionLanguages?: boolean;
  hasCustomizedLessonLanguages?: boolean;
};

export default ReadingPreferences;
