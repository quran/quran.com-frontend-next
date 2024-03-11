/* eslint-disable max-lines */
export const SURAH = 112;

export function getNormalizedIntervals(start, end) {
  const FRAMES = 30;
  const normalizedStart = (start / 1000) * FRAMES;
  const normalizedEnd = (end / 1000) * FRAMES;
  const durationInFrames = normalizedEnd - normalizedStart;

  return {
    start: Math.ceil(normalizedStart),
    durationInFrames: Math.ceil(durationInFrames),
  };
}

export function getBackgroundWithOpacity(colorObj, newAlpha) {
  const rgbaRegex = /rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),([0-1](\.\d+)?)\)/g;
  const colorString = colorObj.background;
  const modifiedString = colorString.replace(rgbaRegex, (match, red, green, blue, alpha) => {
    const modifiedAlpha = newAlpha !== undefined ? newAlpha : alpha;
    return `rgba(${red},${green},${blue},${modifiedAlpha})`;
  });

  return { ...colorObj, background: modifiedString };
}

export function getNormalizedTimestamps(audio) {
  const result = [];
  for (let i = 0; i < audio.verseTimings.length; i += 1) {
    const currentVerse = audio.verseTimings[i];
    result.push(getNormalizedIntervals(currentVerse.timestampFrom, currentVerse.timestampTo));
  }
  return result;
}

export function getVideoById(id) {
  const videos = getVideos();
  const videoObj = videos[id];
  if (!videoObj) {
    return null;
  }
  return videoObj;
}

export function getVideosArray() {
  const flattenObject = (obj) => {
    const result = [];

    Object.entries(obj).forEach(([key, value]) => {
      result.push({ ...(value as any), id: parseInt(key, 10) });
    });

    return result;
  };

  return flattenObject(getVideos());
}

// eslint-disable-next-line react-func/max-lines-per-function
export function getVideos() {
  return {
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
}

export const getBackgroundWithOpacityById = (id, opacity) => {
  const colors = getAllBackgrounds(opacity);
  return colors.find((c) => c.id === id);
};

// TODO: perhaps create hashmap of colors if we're using id, instead of an array
// eslint-disable-next-line react-func/max-lines-per-function
export const getAllBackgrounds = (alpha = '0.8') => {
  return [
    {
      id: 1,
      background: `linear-gradient(0deg, rgba(229,227,255,${alpha}) 0%, rgba(230,246,235,${alpha}) 50%, rgba(215,249,255,${alpha}) 100%)`,
    },
    {
      id: 2,
      background: `linear-gradient(0deg, rgba(244,255,227,${alpha}) 0%, rgba(255,229,215,${alpha}) 100%)`,
    },
    {
      id: 3,
      background: `linear-gradient(330deg, rgba(202,166,255,${alpha}) 0%, rgba(152,255,148,${alpha}) 100%)`,
    },
    {
      id: 4,
      background: `linear-gradient(to bottom,rgba(219, 225, 111, ${alpha}), rgba(248, 119, 40, ${alpha}))`,
    },
    {
      id: 5,
      background: `linear-gradient(to bottom,rgba(157, 106, 32, ${alpha}),rgba(68, 155, 169, ${alpha}))`,
    },
    {
      id: 6,
      background: `linear-gradient(to bottom,rgba(144, 240, 134, ${alpha}),rgba(232, 60, 194, ${alpha}))`,
    },
    {
      id: 7,
      background: `linear-gradient(to top,rgba(111, 62, 26, ${alpha}),rgba(6, 81, 104, ${alpha}))`,
    },
    {
      id: 8,
      background: `linear-gradient(to top,rgba(103, 243, 206, ${alpha}),rgba(16, 125, 64, ${alpha}))`,
    },
  ];
};

export function getStyles(dimensions) {
  return {
    justifyContent: 'center',
    color: '#111',
    minWidth: dimensions === 'landscape' ? '60%' : '80%',
    minHeight: dimensions === 'landscape' ? '50%' : '25%',
    width: 'fit-content',
    height: 'fit-content',
    margin: 'auto',
    border: '2px gray solid',
    borderRadius: '20px',
    alignItems: 'center',
  };
}

export const DEFAULT_API_PARAMS = {
  wordFields: 'verse_key,verse_id,page_number,location,text_uthmani,code_v1,qpc_uthmani_hafs',
  translations: [131],
};

export const stls = getStyles('landscape');

// eslint-disable-next-line default-param-last
export function validateVerseRange(from = 1, to, versesCount) {
  const verseTo = to || versesCount;
  return from <= verseTo && from <= versesCount && verseTo <= versesCount;
}

export function getTrimmedAudio(audio, from, to) {
  if (!from?.trim?.() && !to?.trim?.()) {
    return audio;
  }

  const verseFrom = parseInt(from, 10);
  const verseTo = parseInt(to || audio.verseTimings.length, 10); // user provided value or end of surah

  const isRangeValid = validateVerseRange(from, to, audio.verseTimings.length);

  if (!isRangeValid) {
    return audio;
  }

  // when we modify full audio to get specific ranges, 'from' ayah
  // e.g. 255 from full verses array becomes the 0 index in the new
  // array. Similarly, to becomes how many more verses we want after.
  const actualFrom = verseFrom <= 1 ? 1 : verseFrom;
  const actualTo = verseTo - verseFrom;

  const removedAudio = audio.verseTimings.slice(0, actualFrom - 1);
  const removedDuration = removedAudio.reduce((acc, obj) => acc + obj.duration, 0);

  const res = audio;
  res.verseTimings = res.verseTimings.slice(actualFrom - 1);
  if (to) {
    res.verseTimings = res.verseTimings.slice(0, actualTo + 1);
  }
  res.duration = res.verseTimings.reduce((acc, obj) => acc + obj.duration, 0);
  res.verseTimings = res.verseTimings.map((timing) => {
    return {
      ...timing,
      normalizedStart: timing.timestampFrom,
      normalizedEnd: timing.timestampTo,
      timestampFrom: timing.timestampFrom - removedDuration,
      timestampTo: timing.timestampTo - removedDuration,
    };
  });

  return res;
}
