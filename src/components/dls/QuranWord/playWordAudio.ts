import { QURANCDN_AUDIO_BASE_URL } from '@/utils/audio';
import { logEvent } from '@/utils/eventLogger';
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

  const removeDOM = () => {
    window.wordByWordAudioPlayerEl.removeEventListener('ended', removeDOM);
    window.wordByWordAudioPlayerEl.remove();
  };

  window.wordByWordAudioPlayerEl = new Audio(url);
  logEvent('load_audio_file', { audioUrl: url });

  window.wordByWordAudioPlayerEl.play();
  window.wordByWordAudioPlayerEl.addEventListener('ended', removeDOM);
};
