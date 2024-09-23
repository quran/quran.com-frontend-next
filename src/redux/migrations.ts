/* eslint-disable max-lines */
import initialState, { DEFAULT_TAFSIRS } from './defaultSettings/defaultSettings';
import { migrateRecentReadingSessions } from './migration-scripts/migrating-recent-reading-sessions';
import { initialSidebarIsVisible } from './slices/QuranReader/sidebarNavigation';
import { initialState as welcomeMessageInitialState } from './slices/welcomeMessage';

import { consolidateWordByWordState, getDefaultWordByWordDisplay } from '@/utils/wordByWord';
import { MushafLines, QuranFont } from 'types/QuranReader';

export default {
  3: (state) => ({
    ...state,
    audioPlayerState: {
      ...state.audioPlayerState,
      visibility: undefined,
      isExpanded: false,
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
      lastReadVerse: {
        verseKey: null,
        chapterId: null,
        page: null,
        hizb: null,
      },
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
  17: (state) => {
    return {
      ...state,
      fontFaces: {
        loadedFontFaces: [],
      },
    };
  },
  18: (state) => ({
    ...state,
    audioPlayerState: {
      ...state.readingPreferences,
      showTooltipWhenPlayingAudio: false,
    },
  }),
  19: (state) => {
    return {
      ...state,
      welcomeMessage: {
        ...state.welcomeMessage,
        isVisible: true,
      },
    };
  },
  20: (state) => ({
    ...state,
    session: {
      count: 0,
    },
  }),
  21: (state) => ({
    ...state,
    sidebarNavigation: {
      isVisible: initialSidebarIsVisible,
    },
  }),
  22: (state) => {
    return {
      ...state,
      readingTracker: {
        ...state.readingTracker,
        recentReadingSessions: migrateRecentReadingSessions(
          // @ts-ignore, old typing, will always have the issue
          state.readingTracker.recentReadingSessions,
        ),
      },
    };
  },
  23: (state) => ({
    // remove unused selectedWordByWordTranslation, selectedWordByWordTransliteration
    ...state,
    readingPreferences: {
      ...state.readingPreferences,
      selectedWordByWordTranslation: undefined,
      selectedWordByWordTransliteration: undefined,
    },
  }),
  24: (state) => ({
    ...state,
    readingPreferences: {
      ...state.readingPreferences,
      ...consolidateWordByWordState(
        state.readingPreferences.showWordByWordTranslation,
        state.readingPreferences.showWordByWordTransliteration,
        state.readingPreferences.showTooltipFor,
      ),
      showWordByWordTranslation: undefined,
      showWordByWordTransliteration: undefined,
      showTooltipFor: undefined,
    },
  }),
  25: (state) => {
    return {
      ...state,
      welcomeMessage: {
        ...state.welcomeMessage,
        isVisible: true,
      },
    };
  },
  26: (state) => {
    return {
      ...state,
      banner: {
        ...state.banner,
        isBannerVisible: true,
      },
    };
  },
  27: (state) => {
    return {
      ...state,
      welcomeMessage: {
        ...state.welcomeMessage,
        isVisible: true,
      },
    };
  },
  28: (state) => ({
    ...state,
    session: {
      count: 0,
      isDonationPopupVisible: true,
    },
  }),
  29: (state) => ({
    // set the default word by word display to tooltip.
    ...state,
    readingPreferences: {
      ...state.readingPreferences,
      wordByWordDisplay: getDefaultWordByWordDisplay(state.readingPreferences.wordByWordDisplay),
    },
  }),
  30: (state) => ({
    ...state,
    quranReaderStyles: {
      ...state.quranReaderStyles,
      wordByWordFontScale: initialState.quranReaderStyles.wordByWordFontScale,
    },
  }),
  31: (state) => ({
    ...state,
    quranReaderStyles: {
      ...state.quranReaderStyles,
      ...(state.quranReaderStyles.quranFont === QuranFont.Tajweed && {
        quranFont: QuranFont.TajweedV4,
      }),
    },
    session: {
      ...state.session,
      isDonationPopupVisible: true,
    },
  }),
  32: (state) => ({
    ...state,
    quranReaderStyles: {
      ...state.quranReaderStyles,
      ...(state.quranReaderStyles.quranFont === QuranFont.Tajweed && {
        quranFont: QuranFont.TajweedV4,
      }),
    },
  }),
};
