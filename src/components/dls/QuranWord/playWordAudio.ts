import { triggerPauseAudio, triggerResumeAudio } from 'src/components/AudioPlayer/EventTriggers';
import { QURANCDN_AUDIO_BASE_URL } from 'src/utils/audio';
import Word from 'types/Word';

const playWordAudio = (word: Word) => {
  playWordByWordAudio(`${QURANCDN_AUDIO_BASE_URL}${word.audioUrl}`);
};

export default playWordAudio;

/**
 * Given an audio url
 * 1) stop the word by word audio player if it's currently playing
 * 2) pause the main audio player if it's currently playing
 * 3) play the word by word audio
 * 4) resume the main audio player it it's previously was playing
 *
 * Terms
 * - main audio player refer to the audio player in the bottom navbar, this audio player plays the entire chapter
 * - word by word audio player refer to the audio player that play the clicked word
 *
 * @param {string} url
 */
const playWordByWordAudio = (url: string) => {
  // stop the audio and remove the DOM if it exists
  if (window.wordByWordAudioPlayerEl) {
    window.wordByWordAudioPlayerEl.pause();
    window.wordByWordAudioPlayerEl.remove();
    window.wordByWordAudioPlayerEl = null;
  }

  const isMainAudioPlayerPlaying = window.audioPlayerEl && !window.audioPlayerEl.paused;

  const removeDOMAndResumeMainAudioPlayer = () => {
    window.wordByWordAudioPlayerEl.removeEventListener('ended', removeDOMAndResumeMainAudioPlayer);
    window.wordByWordAudioPlayerEl.remove();

    if (isMainAudioPlayerPlaying) triggerResumeAudio();
  };

  window.wordByWordAudioPlayerEl = new Audio(url);
  if (isMainAudioPlayerPlaying) triggerPauseAudio();

  window.wordByWordAudioPlayerEl.play();
  window.wordByWordAudioPlayerEl.addEventListener('ended', removeDOMAndResumeMainAudioPlayer);
};
