import { getNormalizedIntervals } from './helpers';

import AudioData from '@/types/AudioData';
import GenerateMediaFileRequest, {
  MediaType,
  Timestamp,
} from '@/types/Media/GenerateMediaFileRequest';
import Orientation from '@/types/Media/Orientation';
import VerseTiming from '@/types/VerseTiming';
import {
  BACKGROUND_VIDEOS,
  VIDEO_LANDSCAPE_HEIGHT,
  VIDEO_LANDSCAPE_WIDTH,
  VIDEO_PORTRAIT_HEIGHT,
  VIDEO_PORTRAIT_WIDTH,
} from '@/utils/media/constants';

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

export const getDurationInFrames = (timestamps: Timestamp[]) => {
  const durationInFrames = timestamps.reduce((acc, current) => acc + current.durationInFrames, 0);
  return durationInFrames <= 0 ? 1 : durationInFrames;
};

export const prepareGenerateMediaFileRequestData = (data: GenerateMediaFileRequest) => {
  const newData = { ...data };

  if (data.type === MediaType.VIDEO) {
    newData.audio = {
      audioUrl: data.audio.audioUrl,
      duration: data.audio.duration,
      verseTimings: data.audio.verseTimings,
      reciterId: data.audio.reciterId,
    };
  } else {
    delete newData.audio;
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
  delete newData.isPlayer;

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
