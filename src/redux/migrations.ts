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
};
