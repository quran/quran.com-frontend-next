import WatermarkColor from './WatermarkColor';

export enum MediaType {
  VIDEO = 'video',
  IMAGE = 'image',
}

interface Request {
  type: MediaType;
  video: Video;
  timestamps?: Timestamp[];
  audio?: Audio;
  verses: Verse[];
  fontColor: string;
  verseAlignment: string;
  translationAlignment: string;
  backgroundColorId: number;
  quranTextFontScale: number;
  translationFontScale: number;
  shouldHaveBorder: string;
  opacity: string;
  translations: number[];
  orientation: string;
  videoId: number;
  chapterEnglishName: string;
}

interface Video {
  videoSrc: string;
  watermarkColor: WatermarkColor;
}

interface Timestamp {
  start: number;
  durationInFrames: number;
}

interface Audio {
  audioUrl: string;
  duration: number;
  verseTimings: VerseTiming[];
  reciterId: number;
}

interface VerseTiming {
  verseKey: string;
  timestampFrom: number;
  timestampTo: number;
  duration: number;
  segments: number[][];
}

interface Verse {
  chapterId: number;
  verseKey: string;
  words: Word[];
  translations: Translation[];
}

interface Word {
  qpcUthmaniHafs: string;
}

interface Translation {
  id: number;
  text: string;
}

type GenerateMediaFileRequest = Request;

export default GenerateMediaFileRequest;
