import { InterpreterFrom } from 'xstate';

import { RadioActorRef } from '../../radio/types/RadioActorRef';
import { createRepeatMachine } from '../../repeatMachine/repeatMachine';

import AudioData from 'types/AudioData';

interface AudioPlayerContext {
  audioPlayer: HTMLAudioElement;
  reciterId: number;
  surah?: number;
  ayahNumber: number;
  wordLocation?: number;
  audioData: AudioData;
  surahVersesCount: any;
  elapsed: number;
  duration: number;
  downloadProgress: number;
  playbackRate: number;
  shouldPlayFromRandomTimeStamp: boolean;
  verseDelay: number;
  repeatActor: InterpreterFrom<ReturnType<typeof createRepeatMachine>>;
  radioActor: RadioActorRef;
  volume: number;
  recitersList?: any;
}

export default AudioPlayerContext;
