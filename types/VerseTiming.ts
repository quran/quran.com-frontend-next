interface VerseTiming {
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
  duration: number;
  segments: [number, number, number][];
}

export default VerseTiming;
