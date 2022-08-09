const AUDIO_PLAYER_LOCAL_STORAGE_KEY = 'audio-player-state';
export const persistXstateToLocalStorage = (newState: Record<string, any>) => {
  try {
    const previousState = JSON.parse(localStorage.getItem(AUDIO_PLAYER_LOCAL_STORAGE_KEY)) || {};
    const nextState = { ...previousState, ...newState };
    localStorage.setItem(AUDIO_PLAYER_LOCAL_STORAGE_KEY, JSON.stringify(nextState));
  } catch (error) {
    // TODO: log error
  }
};

export const getXstateStateFromLocalStorage = () => {
  try {
    const stateString = localStorage.getItem(AUDIO_PLAYER_LOCAL_STORAGE_KEY);
    if (stateString) {
      return JSON.parse(stateString) || {};
    }
    return {};
  } catch (e) {
    // TODO: log error
    return {};
  }
};
