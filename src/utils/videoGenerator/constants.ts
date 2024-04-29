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
export const DEFAULT_BACKGROUND_COLOR_ID = 1;
export const DEFAULT_QURAN_FONT_SCALE = 3;
export const DEFAULT_TRANSLATION_FONT_SCALE = 3;
export const DEFAULT_SHOULD_HAVE_BORDER = 'false';
export const DEFAULT_VIDEO_ID = 4;

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
};

export const COMPOSITION_PROPS = z.object({
  video: z.any(),
  verses: z.any(),
  audio: z.any(),
  timestamps: z.any(),
  fontColor: z.any(),
  verseAlignment: z.string(),
  translationAlignment: z.string(),
  backgroundColorId: z.number(),
  quranTextFontScale: z.number(),
  translationFontScale: z.number(),
  shouldHaveBorder: z.string(),
  opacity: z.string(),
  translations: z.number().array(),
  orientation: z.string(),
  videoId: z.number(),
  frame: z.number().optional(),
});

export const REGION = 'us-east-1';
// export const REGION = 'eu-north-1';
export const SITE_NAME = 'quran-app';
export const RAM = 2048;
export const DISK = 2048;
export const TIMEOUT = 240;
