/*
 * These are audio player actions meant to be triggered globally from any part of the application.
 * This approach is a workaround because of the limitations we have with audio playback with being
 * blocked by browsers.
 */

export const triggerPlayAudio = () => {
  console.log('playing the audio');
  if (process.browser && window) {
    window.audioPlayerEl.play();
  }
};

export const triggerPauseAudio = () => {
  console.log('audio paused');
  if (process.browser && window) {
    window.audioPlayerEl.pause();
  }
};

export const triggerSetCurrentTime = (newTime: number) => {
  console.log('setting new time to', newTime);
  if (process.browser && window) {
    let currentTime = newTime;
    if (newTime < 0) currentTime = 0;

    const { duration } = window.audioPlayerEl;
    if (newTime > duration) currentTime = duration;

    window.audioPlayerEl.currentTime = currentTime;
    console.log('the new currentime is', window.audioPlayerEl.currentTime);
  }
};

export const triggerSeek = (duration) => {
  if (process.browser && window) {
    triggerSetCurrentTime(window.audioPlayerEl.currentTime + duration);
  }
};

export default { triggerPlayAudio, triggerPauseAudio, triggerSetCurrentTime };
