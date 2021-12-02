import initialState, { DEFAULT_TAFSIRS } from './defaultSettings/defaultSettings';
import { getAudioPlayerStateInitialState } from './defaultSettings/util';
import { initialState as welcomeMessageInitialState } from './slices/welcomeMessage';

import { MushafLines } from 'types/QuranReader';

export default {
  3: (state) => ({
    ...state,
    audioPlayerState: {
      ...state.audioPlayerState,
      visibility: undefined,
      isExpanded: false,
      isMobileMinimizedForScrolling: false,
    },
  }),
  4: (state) => ({
    ...state,
    search: {
      searchHistory: [],
    },
  }),
  5: (state) => ({
    ...state,
    readingTracker: {
      lastReadVerse: { verseKey: null, chapterId: null, page: null, hizb: null },
    },
  }),
  6: (state) => ({
    ...state,
    readingTracker: {
      ...state.readingTracker,
      recentReadingSessions: {},
    },
  }),
  7: (state) => ({
    ...state,
    quranReaderStyles: {
      ...state.quranReaderStyles,
      mushafLines: MushafLines.SixteenLines,
    },
  }),
  8: (state) => ({
    ...state,
    audioPlayerState: {
      ...state.audioPlayerState,
      repeatSettings: getAudioPlayerStateInitialState().repeatSettings,
      repeatProgress: getAudioPlayerStateInitialState().repeatProgress,
    },
  }),
  9: (state) => ({
    ...state,
    commandBar: {
      isOpen: false,
      recentNavigations: [],
    },
  }),
  10: (state) => ({
    ...state,
    commandBar: {
      isOpen: undefined,
      recentNavigations: [],
    },
  }),
  11: (state) => ({
    ...state,
    tafsirs: {
      ...state.tafsirs,
      selectedTafsirs: DEFAULT_TAFSIRS, // over-ride the current value to only include 169 ID and remove 171
    },
  }),
  12: (state) => ({
    ...state,
    welcomeMessage: welcomeMessageInitialState,
  }),
  13: (state) => ({
    ...state,
    audioPlayerState: {
      ...state.audioPlayerState,
      reciter: getAudioPlayerStateInitialState().reciter.id,
    },
  }),
  14: (state) => ({
    ...state,
    readingPreferences: {
      ...state.readingPreferences,
      wordClickFunctionality: initialState.readingPreferences.wordClickFunctionality,
    },
  }),
  15: (state) => ({
    ...state,
    defaultSettings: {
      isUsingDefaultSettings: true,
    },
    audioPlayerState: {
      ...state.audioPlayerState,
      isUsingDefaultReciter: true,
    },
  }),
  16: (state) => ({
    ...state,
    readingPreferences: {
      ...state.readingPreferences,
      selectedWordByWordLocale: initialState.readingPreferences.selectedWordByWordLocale,
      isUsingDefaultWordByWordLocale:
        initialState.readingPreferences.isUsingDefaultWordByWordLocale,
    },
  }),
  17: (state) => ({
    ...state,
    fontFaces: {
      loadedFontFaces: [],
    },
  }),
};
