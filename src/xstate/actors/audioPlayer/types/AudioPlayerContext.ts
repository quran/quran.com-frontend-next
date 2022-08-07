import { RadioActorRef } from '../../radio/types/RadioActorRef';

import { AudioFile } from './services/AudioData';

interface AudioPlayerContext {
  audioPlayer: HTMLAudioElement;
  reciterId: number;
  surah?: number;
  newSurah?: number;
  newAyahNumber?: number;
  ayahNumber: number;
  audioData: AudioFile;
  surahVersesCount: any;
  elapsed: number;
  duration: number;
  playbackRate: number;
  shouldPlayFromRandomTimeStamp: boolean;
  verseDelay: number;
  repeatActor: any;
  radioActor: RadioActorRef;
}

export default AudioPlayerContext;
