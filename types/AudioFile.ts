import VerseTiming from './VerseTiming';

interface AudioFile {
  id: number;
  chapterId: number;
  fileSize: number;
  format: string;
  audioUrl: string;
  duration: number;
  verseTimings?: VerseTiming[];
}

export default AudioFile;
