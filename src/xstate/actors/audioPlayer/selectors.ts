/* eslint-disable import/prefer-default-export */

import { getAudioPlayerStateInitialState } from 'src/redux/defaultSettings/util';

export const selectIsUsingDefaultReciter = (state, locale: string) =>
  state.context.reciterId === getAudioPlayerStateInitialState(locale).reciter.id;

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
