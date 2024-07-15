import { toLocalizedVerseKey } from '../locale';

import defaultAudio from './defaultAudio.json';
import defaultVerses from './defaultVerses.json';

import Alignment from '@/types/Media/Alignment';
import Orientation from '@/types/Media/Orientation';
import WatermarkColor from '@/types/Media/WatermarkColor';
import { QuranFont } from '@/types/QuranReader';
import Verse from '@/types/Verse';

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
export const DEFAULT_QURAN_FONT_STYLE = QuranFont.QPCHafs;
export const DEFAULT_SHOULD_HAVE_BORDER = 'false';
export const DEFAULT_VIDEO_ID = 4;
export const DEFAULT_OPACITY = '0.2';
export const DEFAULT_FONT_COLOR = '#dddddd';
export const COMPOSITION_NAME = 'MediaMakerContent';

export function getDefaultVerseKeys(lang = 'en') {
  const keys = defaultVerses.map((verse) => `${verse.chapterId}:${verse.verseNumber}`);
  return keys.map((chapterVersesKey) => ({
    id: chapterVersesKey,
    name: chapterVersesKey,
    value: chapterVersesKey,
    label: toLocalizedVerseKey(chapterVersesKey, lang),
  }));
}

const DEFAULT_TIMESTAMPS = [
  {
    start: 0,
    durationInFrames: 90,
  },
];

export const DEFAULT_API_PARAMS = {
  wordFields: `${QuranFont.QPCHafs},${QuranFont.IndoPak}`,
  translations: [DEFAULT_TRANSLATION],
  reciter: DEFAULT_RECITER_ID,
  perPage: 1,
};

// NOTE: If you change the order of the videos, make sure to sync it in the backend too.
export const BACKGROUND_VIDEOS = {
  1: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/sea.png',
    videoSrc: '/videos/videos_sea.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  2: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/abstract.png',
    videoSrc: '/videos/videos_abstract.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  3: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/windmill.png',
    videoSrc: '/videos/videos_windmill.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  4: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/stars.png',
    videoSrc: '/videos/videos_stars.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  5: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/nature.png',
    videoSrc: '/videos/videos_nature.mp4',
    watermarkColor: WatermarkColor.LIGHT,
  },
  6: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/snow.png',
    videoSrc: '/videos/videos_snow.mp4',
    watermarkColor: WatermarkColor.DARK,
  },
};

export const DEFAULT_PROPS = {
  video: { ...BACKGROUND_VIDEOS[DEFAULT_VIDEO_ID], id: DEFAULT_VIDEO_ID },
  verses: defaultVerses as unknown as Verse[],
  audio: defaultAudio,
  timestamps: DEFAULT_TIMESTAMPS,
  fontColor: DEFAULT_FONT_COLOR,
  verseAlignment: Alignment.CENTRE,
  translationAlignment: Alignment.CENTRE,
  backgroundColorId: DEFAULT_BACKGROUND_COLOR_ID,
  quranTextFontScale: DEFAULT_QURAN_FONT_SCALE,
  quranTextFontStyle: DEFAULT_QURAN_FONT_STYLE,
  translationFontScale: DEFAULT_TRANSLATION_FONT_SCALE,
  shouldHaveBorder: DEFAULT_SHOULD_HAVE_BORDER,
  opacity: DEFAULT_OPACITY,
  translations: [DEFAULT_TRANSLATION],
  orientation: Orientation.LANDSCAPE,
  videoId: DEFAULT_VIDEO_ID,
  chapterEnglishName: 'The Sincerity',
};
