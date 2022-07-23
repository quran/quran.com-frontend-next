import AudioDataStatus from 'src/redux/types/AudioDataStatus';
import AudioState from 'src/redux/types/AudioState';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import ReadingPreferences from 'src/redux/types/ReadingPreferences';
import RepeatProgress from 'src/redux/types/RepeatProgress';
import RepeatSettings from 'src/redux/types/RepeatSettings';
import SliceName from 'src/redux/types/SliceName';
import TafsirsSettings from 'src/redux/types/TafsirsSettings';
import Theme from 'src/redux/types/Theme';
import ThemeType from 'src/redux/types/ThemeType';
import TranslationsSettings from 'src/redux/types/TranslationsSettings';
import {
  ReadingPreference,
  WordByWordType,
  WordClickFunctionality,
  MushafLines,
  QuranFont,
} from 'types/QuranReader';
import Reciter from 'types/Reciter';

export interface DefaultSettings {
  [SliceName.THEME]: Theme;
  [SliceName.READING_PREFERENCES]: ReadingPreferences;
  [SliceName.QURAN_READER_STYLES]: QuranReaderStyles;
  [SliceName.TRANSLATIONS]: TranslationsSettings;
  [SliceName.TAFSIRS]: TafsirsSettings;
  [SliceName.AUDIO_PLAYER_STATE]: AudioState;
  [SliceName.DEFAULT_SETTINGS]: { isUsingDefaultSettings: boolean };
}

// Tafsir Ibn Kathir in English
export const DEFAULT_TAFSIRS = ['en-tafisr-ibn-kathir'];

export const DEFAULT_RECITER: Reciter = {
  id: 7,
  name: 'Mishari Rashid al-`Afasy',
  recitationStyle: 'Warsh',
  relativePath: 'mishaari_raashid_al_3afaasee',
};

const TAFSIRS_INITIAL_STATE: TafsirsSettings = {
  selectedTafsirs: DEFAULT_TAFSIRS,
  isUsingDefaultTafsirs: true,
};

export const DEFAULT_TRANSLATIONS = [131]; // Dr. Mustafa Khattab, the Clear Quran

const TRANSLATIONS_INITIAL_STATE: TranslationsSettings = {
  selectedTranslations: DEFAULT_TRANSLATIONS,
  isUsingDefaultTranslations: true,
};

const QURAN_READER_STYLES_INITIAL_STATE: QuranReaderStyles = {
  // the base sizes in rem
  tafsirFontScale: 3,
  quranTextFontScale: 3,
  translationFontScale: 3,
  quranFont: QuranFont.MadaniV1,
  mushafLines: MushafLines.SixteenLines,
  isUsingDefaultFont: true,
};

const DEFAULT_WBW_TRANSLATION = 20;
const DEFAULT_WBW_TRANSLITERATION = 12;
const DEFAULT_WBW_LOCALE = 'en';

const READING_PREFERENCES_INITIAL_STATE: ReadingPreferences = {
  readingPreference: ReadingPreference.Translation,
  showWordByWordTranslation: false,
  selectedWordByWordTranslation: DEFAULT_WBW_TRANSLATION,
  showWordByWordTransliteration: false,
  selectedWordByWordTransliteration: DEFAULT_WBW_TRANSLITERATION,
  selectedWordByWordLocale: DEFAULT_WBW_LOCALE,
  isUsingDefaultWordByWordLocale: true,
  showTooltipFor: [WordByWordType.Translation],
  wordClickFunctionality: WordClickFunctionality.PlayAudio,
};

const THEME_INITIAL_STATE: Theme = {
  type: ThemeType.Auto,
};

const DEFAULT_PLAYBACK_RATE = 1;

const DEFAULT_REPEAT_SETTINGS: RepeatSettings = {
  delayMultiplier: 0,
  repeatRange: 3,
  repeatEachVerse: 1,
  from: null,
  to: null,
};

const DEFAULT_REPEAT_PROGRESS: RepeatProgress = {
  repeatEachVerse: 1,
  repeatRange: 1,
};

const AUDIO_INITIAL_STATE: AudioState = {
  enableAutoScrolling: true,
  isPlaying: false,
  audioData: null,
  reciter: DEFAULT_RECITER,
  audioDataStatus: AudioDataStatus.NoFile,
  repeatSettings: DEFAULT_REPEAT_SETTINGS,
  repeatProgress: DEFAULT_REPEAT_PROGRESS,
  isDownloadingAudio: false,
  playbackRate: DEFAULT_PLAYBACK_RATE,
  isUsingDefaultReciter: true,
  showTooltipWhenPlayingAudio: false,
  isRadioMode: false,
};

export default {
  [SliceName.THEME]: THEME_INITIAL_STATE,
  [SliceName.READING_PREFERENCES]: READING_PREFERENCES_INITIAL_STATE,
  [SliceName.QURAN_READER_STYLES]: QURAN_READER_STYLES_INITIAL_STATE,
  [SliceName.TRANSLATIONS]: TRANSLATIONS_INITIAL_STATE,
  [SliceName.TAFSIRS]: TAFSIRS_INITIAL_STATE,
  [SliceName.AUDIO_PLAYER_STATE]: AUDIO_INITIAL_STATE,
} as DefaultSettings;
