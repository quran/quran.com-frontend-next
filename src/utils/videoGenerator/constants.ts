export const DEFAULT_SURAH = 112;
export const DEFAULT_RECITER_ID = 7;
export const DEFAULT_TRANSLATION = 131;
export const VIDEO_PORTRAIT_HEIGHT = 1280;
export const VIDEO_LANDSCAPE_HEIGHT = 720;
export const VIDEO_PORTRAIT_WIDTH = 720;
export const VIDEO_LANDSCAPE_WIDTH = 1280;
export const VIDEO_FPS = 30;

export const DEFAULT_API_PARAMS = {
  wordFields: 'verse_key,verse_id,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs',
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

export const VIDEOS = {
  1: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/sea.png',
    videoSrc: 'https://images.quran.com/videos/sea.mp4',
    watermarkColor: 'light',
  },
  2: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/abstract.png',
    videoSrc: 'https://images.quran.com/videos/abstract.mp4',
    watermarkColor: 'light',
  },
  3: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/windmill.png',
    videoSrc: 'https://images.quran.com/videos/windmill.mp4',
    watermarkColor: 'light',
  },
  4: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/stars.png',
    videoSrc: 'https://images.quran.com/videos/stars.mp4',
    watermarkColor: 'light',
  },
  5: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/nature.png',
    videoSrc: 'https://images.quran.com/videos/nature.mp4',
    watermarkColor: 'light',
  },
  6: {
    thumbnailSrc: 'https://images.quran.com/videos/thumbnails/snow.png',
    videoSrc: 'https://images.quran.com/videos/snow.mp4',
    watermarkColor: 'dark',
  },
};
