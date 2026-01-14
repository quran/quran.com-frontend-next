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
  wordByWordDisplay: WordByWordDisplay[];
  wordClickFunctionality: WordClickFunctionality;
  isUsingDefaultWordByWordLocale: boolean;
  selectedReadingTranslation: string | null;
};

export default ReadingPreferences;
