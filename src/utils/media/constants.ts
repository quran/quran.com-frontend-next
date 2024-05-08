import defaultAudio from './defaultAudio.json';
import defaultVerses from './defaultVerses.json';

import WatermarkColor from '@/types/Media/WatermarkColor';
import { QuranFont } from '@/types/QuranReader';

export const DEFAULT_SURAH = 112;
export const DEFAULT_RECITER_ID = 7;
export const DEFAULT_TRANSLATION = 131;
export const VIDEO_PORTRAIT_HEIGHT = 1280;
export const VIDEO_LANDSCAPE_HEIGHT = 720;
export const VIDEO_PORTRAIT_WIDTH = 720;
export const VIDEO_LANDSCAPE_WIDTH = 1280;
export const VIDEO_FPS = 30;
export const DEFAULT_BACKGROUND_COLOR_ID = 1;
export const DEFAULT_QURAN_FONT_SCALE = 3;
export const DEFAULT_TRANSLATION_FONT_SCALE = 3;
export const DEFAULT_SHOULD_HAVE_BORDER = 'false';
export const DEFAULT_VIDEO_ID = 4;
export const DEFAULT_OPACITY = '0.2';
export const DEFAULT_FONT_COLOR = '#dddddd';
export const COMPOSITION_NAME = 'MediaMakerContent';

const DEFAULT_TIMESTAMPS = [
  {
    start: 0,
    durationInFrames: 90,
  },
];

export const DEFAULT_API_PARAMS = {
  wordFields: QuranFont.QPCHafs,
  translations: [DEFAULT_TRANSLATION],
  reciter: DEFAULT_RECITER_ID,
  perPage: 1,
};

export enum Alignment {
  CENTRE = 'centre',
  JUSTIFIED = 'justified',
}

export enum Orientation {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
}

// NOTE: If you change the order of the videos, make sure to sync it in the backend too.
export const BACKGROUND_VIDEOS = {
  1: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/sea.png',
    videoSrc: 'https://images.quran.com/videos/sea.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  2: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/abstract.png',
    videoSrc: 'https://images.quran.com/videos/abstract.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  3: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/windmill.png',
    videoSrc: 'https://images.quran.com/videos/windmill.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  4: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/stars.png',
    videoSrc: 'https://images.quran.com/videos/stars.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  5: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/nature.png',
    videoSrc: 'https://images.quran.com/videos/nature.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  6: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/snow.png',
    videoSrc: 'https://images.quran.com/videos/snow.mp4',
    watermarkColor: WatermarkColor.DARK,
  },
};

export const DEFAULT_PROPS = {
  video: { ...BACKGROUND_VIDEOS[DEFAULT_VIDEO_ID], id: DEFAULT_VIDEO_ID },
  verses: defaultVerses,
  audio: defaultAudio,
  timestamps: DEFAULT_TIMESTAMPS,
  fontColor: DEFAULT_FONT_COLOR,
  verseAlignment: Alignment.CENTRE,
  translationAlignment: Alignment.CENTRE,
  backgroundColorId: DEFAULT_BACKGROUND_COLOR_ID,
  quranTextFontScale: DEFAULT_QURAN_FONT_SCALE,
  translationFontScale: DEFAULT_TRANSLATION_FONT_SCALE,
  shouldHaveBorder: DEFAULT_SHOULD_HAVE_BORDER,
  opacity: DEFAULT_OPACITY,
  translations: [DEFAULT_TRANSLATION],
  orientation: Orientation.LANDSCAPE,
  videoId: DEFAULT_VIDEO_ID,
  chapterEnglishName: 'The Sincerity',
};
