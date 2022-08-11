/* eslint-disable import/prefer-default-export */

import { getAudioPlayerStateInitialState } from 'src/redux/defaultSettings/util';

export const selectIsUsingDefaultReciter = (state, locale: string) =>
  state.context.reciterId === getAudioPlayerStateInitialState(locale).reciter.id;
