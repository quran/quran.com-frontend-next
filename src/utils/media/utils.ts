/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { ParsedUrlQuery } from 'querystring';

import { getChapterData } from '../chapter';
import { QueryParamValueType } from '../query-params';
import { isValidVerseFrom, isValidVerseKey, isValidVerseTo } from '../validator';

import { getNormalizedIntervals } from './helpers';

import { RootState } from '@/redux/RootState';
import AudioData from '@/types/AudioData';
import ChaptersData from '@/types/ChaptersData';
import GenerateMediaFileRequest, { Timestamp } from '@/types/Media/GenerateMediaFileRequest';
import Orientation from '@/types/Media/Orientation';
import QueryParam from '@/types/QueryParam';
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

/**
 * Prepares the data for generating a media file request.
 *
 * @param {GenerateMediaFileRequest} data - The GenerateMediaFileRequest data.
 * @returns {object} The prepared data for generating a media file request.
 */
export const prepareGenerateMediaFileRequestData = (data: GenerateMediaFileRequest): object => {
  const newData = { ...data };
  // @ts-ignore
  newData.audio = {
    reciterId: data.audio.reciterId,
  };

  const { verseKey: startVerseKey, chapterId } = newData.verses[0];
  const { verseKey: endVerseKey } = newData.verses[newData.verses.length - 1];

  delete newData.chapterEnglishName;
  delete newData.video;
  delete newData.verseKeys;
  delete newData.isPlayer;
  delete newData.verses;
  delete newData.timestamps;

  return { ...newData, chapterId, startVerseKey, endVerseKey };
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

export type QueryParamsData = Record<
  QueryParam,
  {
    reduxValueSelector: (state: RootState) => any;
    queryParamValueType: QueryParamValueType;
    reduxValueEqualityFunction?: (left: any, right: any) => boolean;
    isValidQueryParam: (
      queryParamValue?: any,
      chaptersData?: ChaptersData,
      query?: ParsedUrlQuery,
      reduxSelectorValueOrValues?: any,
      extraData?: any,
    ) => boolean;
    reduxObjectKey?: string; // if the value coming from redux is an object and not a single key
    customValueGetterWhenParamIsInvalid?: <T>(
      reduxSelectorValueOrValues?: T,
      reduxParamValue?: any,
    ) => any; // will be used if we don't want to use the default redux value but rather provide a custom value instead
  }
>;

/**
 * This function will make sure the verse from and verse to are valid
 * and within the bounds of the chapter data
 *
 * @param {QueryParam} queryParam
 * @param {ChaptersData} chaptersData
 * @param {ParsedUrlQuery} query
 * @returns {boolean}
 */
export const isValidVerseToOrFrom = (
  queryParam: QueryParam.VERSE_TO | QueryParam.VERSE_FROM,
  chaptersData: ChaptersData,
  query: ParsedUrlQuery,
): boolean => {
  const isVerseFrom = queryParam === QueryParam.VERSE_FROM;
  const verseFromQueryParamValue = String(query[QueryParam.VERSE_FROM]);
  const verseToQueryParamValue = String(query[QueryParam.VERSE_TO]);
  const surahID = String(query[QueryParam.SURAH]);

  const verseFromKey = `${surahID}:${verseFromQueryParamValue}`;
  const verseToKey = `${surahID}:${verseToQueryParamValue}`;
  const isValidValue = isValidVerseKey(chaptersData, isVerseFrom ? verseFromKey : verseToKey);
  const versesCount = getChapterData(chaptersData, surahID)?.versesCount;

  if (isVerseFrom) {
    return isValidValue && isValidVerseFrom(verseFromKey, verseToKey, versesCount, surahID);
  }
  return isValidValue && isValidVerseTo(verseFromKey, verseToKey, versesCount, surahID);
};

/**
 * This function will make sure the string passed is a valid hex color
 *
 * @param {string} color
 * @returns {boolean}
 */
export const isValidHexColor = (color: string) => {
  // Regular expression to match a valid hex color
  const hexPattern = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
  return hexPattern.test(color);
};
