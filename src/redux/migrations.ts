import { defaultRepeatProgress, defaultRepeatSettings } from './slices/AudioPlayer/state';

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
      repeatSettings: defaultRepeatSettings,
      repeatProgress: defaultRepeatProgress,
    },
  }),
  9: (state) => ({
    ...state,
    commandBar: {
      isOpen: false,
      recentNavigations: [],
    },
  }),
};
