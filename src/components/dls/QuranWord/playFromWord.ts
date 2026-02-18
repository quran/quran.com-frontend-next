import { InterpreterFrom } from 'xstate';

import { milliSecondsToSeconds } from '@/utils/datetime';
import { getChapterNumberFromKey, getVerseNumberFromKey } from '@/utils/verse';
import { audioPlayerMachine } from 'src/xstate/actors/audioPlayer/audioPlayerMachine';
import { getWordTimeSegment } from 'src/xstate/actors/audioPlayer/audioPlayerMachineHelper';
import VerseTiming from 'types/VerseTiming';
import Word from 'types/Word';

type AudioService = InterpreterFrom<typeof audioPlayerMachine>;

let activeCleanup: (() => void) | null = null;

const seekToWord = (word: Word, audioService: AudioService, verseTimings: VerseTiming[]) => {
  const wordSegment = getWordTimeSegment(verseTimings, word);
  if (wordSegment) {
    audioService.send({ type: 'SEEK_TO', timestamp: milliSecondsToSeconds(wordSegment[0]) });
  }
};

const playAndSeekAfterLoad = (word: Word, audioService: AudioService): (() => void) => {
  const wordSurah = Number(getChapterNumberFromKey(word.verseKey));
  const verseNumber = Number(getVerseNumberFromKey(word.verseKey));

  audioService.send({ type: 'PLAY_AYAH', surah: wordSurah, ayahNumber: verseNumber });

  let unsubscribed = false;
  const cleanup = () => {
    if (!unsubscribed) {
      subscription.unsubscribe();
      unsubscribed = true;
      activeCleanup = null;
    }
  };
  const subscription = audioService.subscribe((state) => {
    if (unsubscribed) return;
    if (
      state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING') &&
      state.context.audioData?.verseTimings
    ) {
      seekToWord(word, audioService, state.context.audioData.verseTimings);
      cleanup();
    } else if (state.matches('IDLE') || state.done) {
      cleanup();
    }
  });

  return cleanup;
};

const playFromWord = (word: Word, audioService: AudioService): void => {
  activeCleanup?.();
  activeCleanup = null;

  const currentState = audioService.getSnapshot();
  const isPlaying = currentState.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING');
  const isPaused = currentState.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PAUSED');
  const wordSurah = Number(getChapterNumberFromKey(word.verseKey));
  const isSameSurah = currentState.context.surah === wordSurah;

  if ((isPlaying || isPaused) && isSameSurah) {
    const timings = currentState.context.audioData?.verseTimings;
    if (!timings) return;
    seekToWord(word, audioService, timings);
    if (isPaused) {
      audioService.send({ type: 'TOGGLE' });
    }
    return;
  }

  activeCleanup = playAndSeekAfterLoad(word, audioService);
};

export default playFromWord;
