import { ReadingPreference, WordByWordType, WordClickFunctionality } from 'types/QuranReader';

type ReadingPreferences = {
  readingPreference: ReadingPreference;
  showWordByWordTranslation: boolean;
  selectedWordByWordTranslation: number;
  selectedWordByWordLocale: string;
  showWordByWordTransliteration: boolean;
  selectedWordByWordTransliteration: number;
  showTooltipFor: WordByWordType[];
  wordClickFunctionality: WordClickFunctionality;
  isUsingDefaultWordByWordLocale: boolean;
};

export default ReadingPreferences;
