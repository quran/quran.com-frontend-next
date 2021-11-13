import { ReadingPreference, WordByWordType, WordClickFunctionality } from 'types/QuranReader';

type ReadingPreferences = {
  readingPreference: ReadingPreference;
  showWordByWordTranslation: boolean;
  selectedWordByWordTranslation: number;
  showWordByWordTransliteration: boolean;
  selectedWordByWordTransliteration: number;
  showTooltipFor: WordByWordType[];
  wordClickFunctionality: WordClickFunctionality;
};

export default ReadingPreferences;
