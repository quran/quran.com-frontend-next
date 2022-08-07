import { InterpreterFrom } from 'xstate';

import { RadioActorRef } from '../../radio/types/RadioActorRef';
import { createRepeatMachine } from '../../repeatMachine/repeatMachine';

import { AudioFile } from './services/AudioData';

interface AudioPlayerContext {
  audioPlayer: HTMLAudioElement;
  reciterId: number;
  surah?: number;
  newSurah?: number;
  newAyahNumber?: number;
  ayahNumber: number;
  wordLocation: number;
  audioData: AudioFile;
  surahVersesCount: any;
  elapsed: number;
  duration: number;
  playbackRate: number;
  shouldPlayFromRandomTimeStamp: boolean;
  verseDelay: number;
  repeatActor: InterpreterFrom<ReturnType<typeof createRepeatMachine>>;
  radioActor: RadioActorRef;
}

export default AudioPlayerContext;
