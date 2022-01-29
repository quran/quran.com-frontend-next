import AudioDataStatus from './AudioDataStatus';
import RepeatProgress from './RepeatProgress';
import RepeatSettings from './RepeatSettings';

import AudioData from 'types/AudioData';
import Reciter from 'types/Reciter';

type AudioState = {
  isPlaying: boolean;
  reciter: Reciter;
  audioData: AudioData;
  audioDataStatus: AudioDataStatus;
  isMobileMinimizedForScrolling: boolean;
  enableAutoScrolling: boolean;
  repeatSettings: RepeatSettings;
  repeatProgress: RepeatProgress;
  isDownloadingAudio: boolean;
  playbackRate: number;
  isUsingDefaultReciter: boolean;
  showTooltipWhenPlayingAudio: boolean;
  isRadioMode: boolean;
};

export default AudioState;
