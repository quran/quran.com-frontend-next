import { StationType } from 'src/components/Radio/types';

type AudioPlayerEventType =
  | { type: 'SET_AUDIO_REF'; audioPlayerRef: HTMLAudioElement }
  | { type: 'SET_PLAYBACK_SPEED'; playbackRate: number }
  | { type: 'PLAY_SURAH'; surah: number }
  | { type: 'PLAY_AYAH'; surah: number; ayahNumber: number }
  | { type: 'CHANGE_RECITER'; reciterId: number; surah?: undefined; audioPlayerRef?: undefined }
  | { type: 'CANCEL_PLAY_MISMATCHED_SURAH' }
  | { type: 'CONFIRM_PLAY_MISMATCHED_SURAH' }
  | { type: 'CLOSE' }
  | { type: 'END' }
  | { type: 'STALL' }
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
  | { type: 'SET_INITIAL_CONTEXT'; reciterId: number; playbackRate: number };

export default AudioPlayerEventType;
