import Segment from './Segment';

interface VerseTiming {
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
  duration: number;
  segments: Segment[];
}

export default VerseTiming;
