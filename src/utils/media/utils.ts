/* eslint-disable max-lines */
/* eslint-disable default-param-last */
/* eslint-disable react-func/max-lines-per-function */
import GenerateMediaFileRequest, { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import {
  BACKGROUND_VIDEOS,
  Orientation,
  VIDEO_LANDSCAPE_WIDTH,
  VIDEO_LANDSCAPE_HEIGHT,
  VIDEO_PORTRAIT_WIDTH,
  VIDEO_PORTRAIT_HEIGHT,
} from '@/utils/media/constants';

export const getNormalizedIntervals = (start, end) => {
  const FRAMES = 30;
  const normalizedStart = (start / 1000) * FRAMES;
  const normalizedEnd = (end / 1000) * FRAMES;
  const durationInFrames = normalizedEnd - normalizedStart;

  return {
    start: Math.ceil(normalizedStart),
    durationInFrames: Math.ceil(durationInFrames),
  };
};

export const orientationToDimensions = (orientation: Orientation) => {
  const isLandscape = orientation === Orientation.LANDSCAPE;
  return {
    width: isLandscape ? VIDEO_LANDSCAPE_WIDTH : VIDEO_PORTRAIT_WIDTH,
    height: isLandscape ? VIDEO_LANDSCAPE_HEIGHT : VIDEO_PORTRAIT_HEIGHT,
  };
};

export const getNormalizedTimestamps = (audio) => {
  const result = [];
  for (let i = 0; i < audio.verseTimings.length; i += 1) {
    const currentVerse = audio.verseTimings[i];
    result.push(getNormalizedIntervals(currentVerse.timestampFrom, currentVerse.timestampTo));
  }
  return result;
};

export const getBackgroundVideoById = (id) => {
  const videoObj = BACKGROUND_VIDEOS[id];
  if (!videoObj) {
    return null;
  }
  return videoObj;
};

export const getVideosArray = () => {
  const flattenObject = (obj) => {
    const result = [];

    Object.entries(obj).forEach(([key, value]) => {
      result.push({ ...(value as any), id: parseInt(key, 10) });
    });

    return result;
  };

  return flattenObject(BACKGROUND_VIDEOS);
};

export const getBackgroundWithOpacityById = (id, opacity) => {
  const colors = getAllBackgrounds(opacity);
  return colors.find((c) => c.id === id);
};

export const getAllBackgrounds = (opacity = '0.8') => {
  return [
    {
      id: 1,
      background: `linear-gradient(0deg, rgba(229,227,255,${opacity}) 0%, rgba(230,246,235,${opacity}) 50%, rgba(215,249,255,${opacity}) 100%)`,
    },
    {
      id: 2,
      background: `linear-gradient(0deg, rgba(244,255,227,${opacity}) 0%, rgba(255,229,215,${opacity}) 100%)`,
    },
    {
      id: 3,
      background: `linear-gradient(330deg, rgba(202,166,255,${opacity}) 0%, rgba(152,255,148,${opacity}) 100%)`,
    },
    {
      id: 4,
      background: `linear-gradient(to bottom,rgba(219, 225, 111, ${opacity}), rgba(248, 119, 40, ${opacity}))`,
    },
    {
      id: 5,
      background: `linear-gradient(to bottom,rgba(157, 106, 32, ${opacity}),rgba(68, 155, 169, ${opacity}))`,
    },
    {
      id: 6,
      background: `linear-gradient(to bottom,rgba(144, 240, 134, ${opacity}),rgba(232, 60, 194, ${opacity}))`,
    },
    {
      id: 7,
      background: `linear-gradient(to top,rgba(111, 62, 26, ${opacity}),rgba(6, 81, 104, ${opacity}))`,
    },
    {
      id: 8,
      background: `linear-gradient(to top,rgba(103, 243, 206, ${opacity}),rgba(16, 125, 64, ${opacity}))`,
    },
  ];
};

export const validateVerseRange = (from = 1, to, versesCount) => {
  const verseTo = to || versesCount;
  return from <= verseTo && from <= versesCount && verseTo <= versesCount;
};

export const getTrimmedAudio = (audio, from, to) => {
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
  const removedDuration = removedAudio.reduce(
    (acc, obj) => acc + (obj.duration >= 0 ? obj.duration : -1 * obj.duration),
    0,
  );

  const res = audio;
  res.verseTimings = res.verseTimings.slice(actualFrom - 1);
  if (to) {
    res.verseTimings = res.verseTimings.slice(0, actualTo + 1);
  }
  res.duration = res.verseTimings.reduce(
    (acc, obj) => acc + (obj.duration >= 0 ? obj.duration : -1 * obj.duration),
    0,
  );
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
};

export const getDurationInFrames = (duration: number) => {
  return Math.ceil((duration / 1000) * 30);
};

export const prepareGenerateMediaFileRequestData = (data: GenerateMediaFileRequest) => {
  const newData = { ...data };

  newData.video = {
    videoSrc: data.video.videoSrc,
    watermarkColor: data.video.watermarkColor,
  };

  if (data.type === MediaType.VIDEO) {
    newData.audio = {
      audioUrl: data.audio.audioUrl,
      duration: data.audio.duration,
      verseTimings: data.audio.verseTimings.map((timing) => ({
        timestampFrom: timing.timestampFrom,
        timestampTo: timing.timestampTo,
        duration: timing.duration,
        segments: timing.segments,
        verseKey: timing.verseKey,
      })),
      reciterId: data.audio.reciterId,
    };
  } else {
    delete newData.audio;
    delete newData.timestamps;
  }

  // Update verses to only include chapterId and words
  newData.verses = data.verses.map((verse) => ({
    chapterId: verse.chapterId,
    verseKey: verse.verseKey,
    words: verse.words.map((word) => ({
      qpcUthmaniHafs: word.qpcUthmaniHafs,
    })),
    translations: verse.translations?.map((translation) => ({
      id: translation.id,
      text: translation.text,
    })),
  }));

  return newData;
};
