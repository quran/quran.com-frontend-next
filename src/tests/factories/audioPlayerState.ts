import merge from 'lodash/merge';

import type AudioState from '@/redux/types/AudioState';

const defaults: AudioState = {
  enableAutoScrolling: true,
  isDownloadingAudio: false,
  showTooltipWhenPlayingAudio: true,
};

export const makeAudioPlayerState = (overrides: Partial<AudioState> = {}): AudioState =>
  merge({ ...defaults }, overrides) as AudioState;
