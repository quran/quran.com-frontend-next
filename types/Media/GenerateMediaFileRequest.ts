import WatermarkColor from './WatermarkColor';

export enum MediaType {
  VIDEO = 'video',
  IMAGE = 'image',
}

interface Request {
  type: MediaType;
  video: Video;
  timestamps?: Timestamp[];
  verseKeys?: {
    id: string;
    label: string;
    name: string;
    value: string;
  };
  audio?: Audio;
  verses: Verse[];
  fontColor: string;
  verseAlignment: string;
  translationAlignment: string;
  quranTextFontScale: number;
  translationFontScale: number;
  opacity: string;
  translations: number[];
  orientation: string;
  videoId: number;
  chapterEnglishName: string;
  isPlayer?: boolean;
  backgroundColor: string;
  borderColor: string;
  borderSize: number;
  chaptersDataArabic: any;
  frame: number;
  quranTextFontStyle: string;
}

interface Video {
  videoSrc: string;
  watermarkColor: WatermarkColor;
}

export interface Timestamp {
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
  text: string;
}

interface Translation {
  id: number;
  text: string;
}

type GenerateMediaFileRequest = Request;

export default GenerateMediaFileRequest;
