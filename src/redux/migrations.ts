export default {
  1: (state) => ({
    ...state,
    audioPlayerState: {
      ...state.audioPlayerState,
      isMinimized: false,
    },
  }),
  2: (state) => ({
    ...state,
    audioPlayerState: {
      ...state.audioPlayerState,
      isMinimized: state.audioPlayerState.isMinimized,
    },
  }),
};
