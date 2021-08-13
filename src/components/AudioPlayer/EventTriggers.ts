/*
 * These are audio player actions meant to be triggered globally from any part of the application.
 * This approach is a workaround because of the limitations we have with audio playback with being
 * blocked by browsers.
 */

export const triggerPlayAudio = () => {
  if (process.browser && window) {
    window.audioPlayerEl.play();
  }
};

export const triggerPauseAudio = () => {
  if (process.browser && window) {
    window.audioPlayerEl.pause();
  }
};

export const triggerSetCurrentTime = (newTime: number) => {
  if (process.browser && window) {
    window.audioPlayerEl.currentTime = newTime;
  }
};

export const triggerSeek = (duration) => {
  if (process.browser && window) {
    triggerSetCurrentTime(window.audioPlayerEl.currentTime + duration);
  }
};

export default { triggerPlayAudio, triggerPauseAudio, triggerSetCurrentTime };
