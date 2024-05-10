/* eslint-disable max-lines */
/* eslint-disable default-param-last */
/* eslint-disable react-func/max-lines-per-function */
import AudioData from '@/types/AudioData';
import GenerateMediaFileRequest, { MediaType } from '@/types/Media/GenerateMediaFileRequest';
import Orientation from '@/types/Media/Orientation';
import VerseTiming from '@/types/VerseTiming';
import {
  BACKGROUND_VIDEOS,
  VIDEO_LANDSCAPE_WIDTH,
  VIDEO_LANDSCAPE_HEIGHT,
  VIDEO_PORTRAIT_WIDTH,
  VIDEO_PORTRAIT_HEIGHT,
} from '@/utils/media/constants';

export const getNormalizedIntervals = (start, end, framesPerSecond: number) => {
  const normalizedStart = (start / 1000) * framesPerSecond;
  const normalizedEnd = (end / 1000) * framesPerSecond;
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

export const getNormalizedTimestamps = (audio: AudioData, framesPerSecond: number) => {
  return audio.verseTimings.map((currentVerse) => {
    return getNormalizedIntervals(
      currentVerse.timestampFrom,
      currentVerse.timestampTo,
      framesPerSecond,
    );
  });
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

/**
 * Get the total duration of the verse timings by
 * subtracting the end time from the start time.
 * We could have used the duration field in the verse timing
 * but BE data is not consistent and sometimes the duration is null.
 *
 * @param {VerseTiming[]} verseTimings
 * @returns {number}
 */
const getVerseTimingsDuration = (verseTimings: VerseTiming[]): number => {
  return verseTimings.reduce(
    (acc, verseTiming) => acc + Math.abs(verseTiming.timestampTo - verseTiming.timestampFrom),
    0,
  );
};

/**
 * Get the audio data for the current range of verses
 * out of the whole chapter audio data.
 *
 * @param {AudioData} chapterAudioData
 * @param {number} fromVerseNumber
 * @param {number} toVerseNumber
 * @returns {AudioData}
 */
export const getCurrentRangesAudioData = (
  chapterAudioData: AudioData,
  fromVerseNumber: number,
  toVerseNumber: number,
): AudioData => {
  const fromVerseIndex = fromVerseNumber - 1;
  const toVerseIndex = toVerseNumber - 1;
  // Remove the audio data outside the range of from and to verse
  const removedAudioBeforeStartVerse = chapterAudioData.verseTimings.slice(0, fromVerseIndex);
  const removedAudioAfterEndVerse = chapterAudioData.verseTimings.slice(toVerseIndex + 1);
  const removedDurationBeforeStartVerse = getVerseTimingsDuration(removedAudioBeforeStartVerse);
  const removedDurationAfterStartVerse = getVerseTimingsDuration(removedAudioAfterEndVerse);
  const rangesChapterData = {
    ...chapterAudioData,
    verseTimings: chapterAudioData.verseTimings
      .slice(fromVerseIndex, toVerseIndex + 1)
      .map((timing) => ({
        ...timing,
        normalizedStart: timing.timestampFrom,
        normalizedEnd: timing.timestampTo,
        timestampFrom: timing.timestampFrom - removedDurationBeforeStartVerse,
        timestampTo: timing.timestampTo - removedDurationBeforeStartVerse,
      })),
  };
  // new total duration of the audio is the duration of the audio minus the removed duration
  rangesChapterData.duration =
    chapterAudioData.duration - (removedDurationBeforeStartVerse + removedDurationAfterStartVerse);

  return rangesChapterData;
};

export const getDurationInFrames = (duration: number, framesPerSecond: number) => {
  return Math.ceil((duration / 1000) * framesPerSecond);
};

export const prepareGenerateMediaFileRequestData = (data: GenerateMediaFileRequest) => {
  const newData = { ...data, shouldHaveBorder: Boolean(data.shouldHaveBorder) };

  newData.video = {
    videoSrc: data.video.videoSrc,
    watermarkColor: data.video.watermarkColor,
  };

  if (data.type === MediaType.VIDEO) {
    newData.audio = {
      audioUrl: data.audio.audioUrl,
      duration: data.audio.duration,
      verseTimings: data.audio.verseTimings,
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

  delete newData.chapterEnglishName;
  delete newData.video;
  delete newData.verseKeys;

  return newData;
};

export const mutateGeneratedMediaCounter = (currentData) => {
  const currentCount = currentData?.data?.count || 0;
  const newCount = currentCount + 1;
  return {
    ...currentData,
    data: {
      count: newCount,
      limit: currentData?.data?.limit,
    },
  };
};
