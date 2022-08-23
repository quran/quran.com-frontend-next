import VerseTiming from './VerseTiming';

interface AudioData {
  id: number;
  chapterId: number;
  fileSize: number;
  format: string;
  audioUrl: string;
  duration: number;
  verseTimings?: VerseTiming[];
  reciterId: number;
}

export default AudioData;
