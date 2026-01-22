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
};

export default ReadingPreferences;
