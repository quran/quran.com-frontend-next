import { z } from 'zod';

import { getDefaultWordFields } from '../api';

import defaultAudio from './defaultAudio.json';
import defaultVerses from './defaultVerses.json';

export const DEFAULT_SURAH = 112;
export const DEFAULT_RECITER_ID = 7;
export const DEFAULT_TRANSLATION = 131;
export const VIDEO_PORTRAIT_HEIGHT = 1280;
export const VIDEO_LANDSCAPE_HEIGHT = 720;
export const VIDEO_PORTRAIT_WIDTH = 720;
export const VIDEO_LANDSCAPE_WIDTH = 1280;
export const VIDEO_FPS = 30;

export const DEFAULT_OPACITY = '0.2';
export const DEFAULT_BACKGROUND = {
  id: 1,
  background: `linear-gradient(0deg, rgba(229,227,255,${DEFAULT_OPACITY}) 0%, rgba(230,246,235,${DEFAULT_OPACITY}) 50%, rgba(215,249,255,${DEFAULT_OPACITY}) 100%)`,
};
export const DEFAULT_FONT_COLOR = '#dddddd';
export const COMPOSITION_NAME = 'VideoContent';

const DEFAULT_TIMESTAMPS = [
  {
    start: 0,
    durationInFrames: 90,
  },
  {
    start: 90,
    durationInFrames: 76,
  },
  {
    start: 166,
    durationInFrames: 90,
  },
  {
    start: 255,
    durationInFrames: 146,
  },
];

export const DEFAULT_API_PARAMS = {
  ...getDefaultWordFields(),
  translations: [DEFAULT_TRANSLATION],
};

export const DEFAULT_STYLES = {
  justifyContent: 'center',
  color: '#111',
  width: 'fit-content',
  maxWidth: '97%',
  height: 'fit-content',
  margin: 'auto',
  border: '2px gray solid',
  borderRadius: '20px',
  alignItems: 'center',
};

export enum WatermarkColor {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum Alignment {
  CENTRE = 'centre',
  JUSTIFIED = 'justified',
}

export enum Orientation {
  LANDSCAPE = 'landscape',
  PORTRAIT = 'portrait',
}

export const VIDEOS = {
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
  video: { ...VIDEOS['1'], id: 1 },
  verses: defaultVerses,
  audio: defaultAudio,
  timestamps: DEFAULT_TIMESTAMPS,
  sceneBackground: DEFAULT_BACKGROUND.background,
  verseBackground: DEFAULT_BACKGROUND.background,
  fontColor: DEFAULT_FONT_COLOR,
  stls: DEFAULT_STYLES,
  verseAlignment: 'centre',
  translationAlignment: 'centre',
  border: 'false',
};

export const COMPOSITION_PROPS = z.object({
  video: z.any(),
  verses: z.any(),
  audio: z.any(),
  timestamps: z.any(),
  sceneBackground: z.any(),
  verseBackground: z.any(),
  fontColor: z.any(),
  stls: z.any(),
  verseAlignment: z.string(),
  translationAlignment: z.string(),
  border: z.string(),
});

export const REGION = 'us-east-1';
// export const REGION = 'eu-north-1';
export const SITE_NAME = 'quran-app';
export const RAM = 2048;
export const DISK = 2048;
export const TIMEOUT = 240;
