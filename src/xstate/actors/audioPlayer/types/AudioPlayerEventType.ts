import { StationType } from '@/components/Radio/types';
import Reciter from 'types/Reciter';

type AudioPlayerEventType =
  | { type: 'SET_AUDIO_REF'; audioPlayerRef: HTMLAudioElement }
  | { type: 'SET_PLAYBACK_SPEED'; playbackRate: number }
  | { type: 'PLAY_SURAH'; surah: number; reciterId?: number }
  | { type: 'PLAY_AYAH'; surah: number; ayahNumber: number }
  | { type: 'CHANGE_RECITER'; reciterId: number; surah?: undefined; audioPlayerRef?: undefined }
  | { type: 'CANCEL_PLAY_MISMATCHED_SURAH' }
  | { type: 'CONFIRM_PLAY_MISMATCHED_SURAH' }
  | { type: 'CLOSE' }
  | { type: 'END' }
  | { type: 'WAITING' }
  | { type: 'SEEKING' }
  | { type: 'SEEKED' }
  | { type: 'TOGGLE' }
  | { type: 'FAIL' }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'CAN_PLAY' }
  | { type: 'PREV_AYAH' }
  | { type: 'NEXT_AYAH' }
  | { type: 'NEXT_AUDIO_TRACK' }
  | { type: 'UPDATE_TIMING' }
  | { type: 'PROGRESS'; timestamp: number }
  | {
      type: 'SET_REPEAT_SETTING';
      from: number;
      to: number;
      repeatRange: number;
      repeatEachVerse: number;
      delayMultiplier: number;
      surah: number;
    }
  | { type: 'REPEAT_AYAH'; ayahNumber: number; verseDelay: number }
  | { type: 'PLAY_RADIO'; stationType: StationType; stationId: number }
  | {
      type: 'PLAY_RADIO_TRACK';
      reciterId: number;
      surah: number;
      shouldPlayFromRandomTimeStamp: boolean;
    }
  | { type: 'REPEAT_FINISHED' }
  | { type: 'SEEK_TO'; timestamp: number }
  | { type: 'SET_INITIAL_CONTEXT'; reciterId: number; playbackRate: number }
  | { type: 'SET_RECITERS_LIST'; recitersList: Reciter[] };

export default AudioPlayerEventType;
