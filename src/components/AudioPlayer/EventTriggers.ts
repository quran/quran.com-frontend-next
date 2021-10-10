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

export const togglePlaying = () => {
  if (process.browser && window) {
    if (window.audioPlayerEl.paused) {
      window.audioPlayerEl.play();
    } else {
      window.audioPlayerEl.pause();
    }
  }
};

export const triggerSetCurrentTime = (newTime: number) => {
  if (process.browser && window) {
    let currentTime = newTime;
    if (newTime < 0) currentTime = 0;

    const { duration } = window.audioPlayerEl;
    if (newTime > duration) currentTime = duration;

    window.audioPlayerEl.currentTime = currentTime;
  }
};

export const triggerSeek = (duration: number) => {
  if (process.browser && window) {
    triggerSetCurrentTime(window.audioPlayerEl.currentTime + duration);
  }
};

export const setPlaybackRate = (playbackRate: number) => {
  if (process.browser && window) {
    window.audioPlayerEl.playbackRate = playbackRate;
  }
};

/**
 * Given a timestamp, check if the audio player is ready. If it is
 * - set the time + play the audio directly
 * - otherwise wait until the audio player is ready before set time + play audio
 *
 * @param timestamp timestamp in seconds
 */
const AUDIO_PLAYER_STATE_READY = 4; // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
export const playFromTimestamp = (timestamp: number) => {
  if (window.audioPlayerEl.readyState === AUDIO_PLAYER_STATE_READY) {
    triggerSetCurrentTime(timestamp);
    triggerPlayAudio();
  } else {
    const playWhenReady = () => {
      triggerSetCurrentTime(timestamp);
      triggerPlayAudio();
      window.audioPlayerEl.removeEventListener('canplaythrough', playWhenReady);
    };
    window.audioPlayerEl.addEventListener('canplaythrough', playWhenReady);
  }
};

export default { triggerPlayAudio, triggerPauseAudio, triggerSetCurrentTime };
