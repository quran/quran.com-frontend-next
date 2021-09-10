export default {
  2: (state) => ({
    ...state,
    audioPlayerState: {
      ...state.audioPlayerState,
      isMinimized: false,
    },
  }),
};
