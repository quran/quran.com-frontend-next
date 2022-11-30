import { StationType } from '@/components/Radio/types';

type RadioEventType =
  | { type: 'TRACK_ENDED' }
  | { type: 'PLAY_STATION'; stationType: StationType; id: string }
  | { type: 'PAUSE_STATION' };

export default RadioEventType;
