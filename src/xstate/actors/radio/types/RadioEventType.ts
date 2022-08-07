import StationType from 'src/xstate/Radio/types/StationType';

type RadioEventType =
  | { type: 'TRACK_ENDED' }
  | { type: 'PLAY_STATION'; stationType: StationType; id: string }
  | { type: 'PAUSE_STATION' };

export default RadioEventType;
