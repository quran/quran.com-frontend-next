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

/**
 * @deprecated
 * use media fragment uri instead
 */
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

/**
 * Given a timestamp, check if the audio player is ready. If it is
 * - set the time + play the audio directly
 * - otherwise wait until the audio player is ready before set time + play audio
 *
 * @param timestamp timestamp in seconds
 */
const AUDIO_PLAYER_STATE_READY = 4; // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
export const playAudioRange = (
  from: number,
  // to?: number
) => {
  // force re-set the audio src
  if (window.audioPlayerEl) {
    const currentUrl = getAudioUrlWithoutMediaFragment(window?.audioPlayerEl.src);
    const url = `${currentUrl}#t=${from}`;
    // if (to) url += `,${to}`;
    window.audioPlayerEl.src = url;
  }

  if (window.audioPlayerEl.readyState === AUDIO_PLAYER_STATE_READY) {
    triggerPlayAudio();
  } else {
    const playWhenReady = () => {
      triggerPlayAudio();
      window.audioPlayerEl.removeEventListener('canplaythrough', playWhenReady);
    };
    window.audioPlayerEl.addEventListener('canplaythrough', playWhenReady);
  }
};

// example
// getAudioUrulWithoutMediaFragment("https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/114.mp3#t=10,15")
// returns "https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/114.mp3"
const getAudioUrlWithoutMediaFragment = (url: string) => {
  if (url.includes('#')) return url.slice(0, url.indexOf('#'));
  return url;
};

export default { triggerPlayAudio, triggerPauseAudio, triggerSetCurrentTime };
