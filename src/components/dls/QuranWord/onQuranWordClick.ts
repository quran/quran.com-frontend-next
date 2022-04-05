import {
  triggerPauseAudio,
  triggerPlayAudio,
  triggerSetCurrentTime,
} from 'src/components/AudioPlayer/EventTriggers';
import { getVerseTimingByVerseKey, QURANCDN_AUDIO_BASE_URL } from 'src/utils/audio';
import AudioData from 'types/AudioData';
import Word from 'types/Word';

/**
 * When user click QuranWord, check if the audio is currently playing, if it is
 * - play the audio from that word's timestamp
 * - otherwise, play the 'word by word audio'
 *
 * @param {Word} word
 * @param {number} playbackRate
 * @param {AudioData} audioData
 */
const onQuranWordClick = (word: Word, playbackRate: number, audioData?: AudioData) => {
  if (window.audioPlayerEl && !window.audioPlayerEl.paused && audioData) {
    const verseTiming = getVerseTimingByVerseKey(word.verseKey, audioData.verseTimings);
    const segment = verseTiming.segments.find(([location]) => word.position === location);
    if (!segment) {
      playWordByWordAudio(`${QURANCDN_AUDIO_BASE_URL}${word.audioUrl}`, playbackRate);
      return;
    }
    const [, startTime] = segment;
    triggerSetCurrentTime(startTime / 1000);
  } else {
    playWordByWordAudio(`${QURANCDN_AUDIO_BASE_URL}${word.audioUrl}`, playbackRate);
  }
};

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
 * @param {number} playbackRate
 */
const playWordByWordAudio = (url: string, playbackRate: number) => {
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

    if (isMainAudioPlayerPlaying) triggerPlayAudio(playbackRate);
  };

  window.wordByWordAudioPlayerEl = new Audio(url);
  if (isMainAudioPlayerPlaying) triggerPauseAudio();

  window.wordByWordAudioPlayerEl.play();
  window.wordByWordAudioPlayerEl.addEventListener('ended', removeDOMAndResumeMainAudioPlayer);
};

export default onQuranWordClick;
