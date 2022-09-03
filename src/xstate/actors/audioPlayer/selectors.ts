/* eslint-disable import/prefer-default-export */

import { DEFAULT_RECITER } from '@/redux/defaultSettings/defaultSettings';
import { makeVerseKey } from '@/utils/verse';

export const selectIsUsingDefaultReciter = (state) =>
  state.context.reciterId === DEFAULT_RECITER.id;

export const selectCurrentAudioReciterId = (state) => state.context.audioData?.reciterId;

export const selectIsLoading = (state) => state.hasTag('loading');

export const selectIsAudioPlaying = (state) =>
  state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING');

export const selectIsPlayingCurrentChapter = (state, chapterId) => {
  const isAudioPlaying = selectIsAudioPlaying(state);
  const currentSurah = state.context.surah;
  return isAudioPlaying && currentSurah === chapterId;
};

export const selectIsLoadingCurrentChapter = (state, chapterId) => {
  const isLoading = selectIsLoading(state);
  const currentSurah = state.context.surah;
  return isLoading && currentSurah === chapterId;
};

export const selectIsVerseBeingPlayed = (state, verseKey) => {
  const { surah, ayahNumber } = state.context;
  return (
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING') &&
    makeVerseKey(surah, ayahNumber) === verseKey
  );
};

export const selectIsVerseLoading = (state, verseKey) => {
  const { surah, ayahNumber } = state.context;
  return selectIsLoading(state) && makeVerseKey(surah, ayahNumber) === verseKey;
};
