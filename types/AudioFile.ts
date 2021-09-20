export interface VerseTiming {
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
  duration: number;
  segments: [number, number, number][];
}
export interface AudioFile {
  id: number;
  chapterId: number;
  fileSize: number;
  format: string;
  audioUrl: string;
  duration: number;
  verseTimings?: VerseTiming[];
}
