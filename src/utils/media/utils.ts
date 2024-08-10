/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { ParsedUrlQuery } from 'querystring';

import { getChapterData } from '../chapter';
import { QueryParamValueType } from '../query-params';
import { isValidVerseFrom, isValidVerseTo } from '../validator';
import { getVerseNumberFromKey } from '../verse';

import { getNormalizedIntervals } from './helpers';

import { RootState } from '@/redux/RootState';
import AudioData from '@/types/AudioData';
import ChaptersData from '@/types/ChaptersData';
import GenerateMediaFileRequest, {
  MediaType,
  Timestamp,
} from '@/types/Media/GenerateMediaFileRequest';
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
      textIndopak: word.textIndopak,
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
    ) => boolean;
    customParamValueGetter?: (
      query: ParsedUrlQuery,
      queryParam: any,
      chaptersData: ChaptersData,
      surahReduxValue: string,
    ) => any;
  }
>;

/**
 * This function will validate the verse from, and verse to
 * and return a valid value or the default value if not valid
 *
 * @param {ParsedUrlQuery} query
 * @param {QueryParam} queryParam
 * @param {ChaptersData} chaptersData
 * @param {QueryParamsData} QUERY_PARAMS_DATA
 * @param {string} surahReduxValue
 * @returns {string}
 */
export const getVerseValue = (
  query: ParsedUrlQuery,
  queryParam: QueryParam.VERSE_FROM | QueryParam.VERSE_TO,
  chaptersData: ChaptersData,
  QUERY_PARAMS_DATA: QueryParamsData,
  surahReduxValue: string,
): string => {
  const verseToOrFromQueryParamConfigs = QUERY_PARAMS_DATA[queryParam];
  const surahQueryParamConfigs = QUERY_PARAMS_DATA[QueryParam.SURAH];
  const verseFromQueryParamValue = String(query[QueryParam.VERSE_FROM]);
  const verseToQueryParamValue = String(query[QueryParam.VERSE_TO]);
  const surahQueryParamValue = String(query[QueryParam.SURAH]);

  const surahID = surahQueryParamConfigs.isValidQueryParam(surahQueryParamValue)
    ? surahQueryParamValue
    : surahReduxValue;
  const isVerseFrom = queryParam === QueryParam.VERSE_FROM;
  const keyOfFirstVerse = `${surahID}:1`;

  const verseFromKey = getVerseNumberFromKey(verseFromQueryParamValue)
    ? verseFromQueryParamValue
    : `${surahID}:${verseFromQueryParamValue}`;

  const verseToKey = getVerseNumberFromKey(verseToQueryParamValue)
    ? verseToQueryParamValue
    : `${surahID}:${verseToQueryParamValue}`;

  const versesCount = getChapterData(chaptersData, surahID)?.versesCount;
  const isValidValue = verseToOrFromQueryParamConfigs.isValidQueryParam(
    isVerseFrom ? verseFromKey : verseToKey,
    chaptersData,
    query,
  );

  const verseKey = isVerseFrom ? verseFromKey : verseToKey;
  const isValidVerseToKey = isValidVerseTo(verseFromKey, verseToKey, versesCount, surahID);
  const isValidVerseFromKey = isValidVerseFrom(verseFromKey, verseToKey, versesCount, surahID);

  return isValidValue && isValidVerseFromKey && isValidVerseToKey ? verseKey : keyOfFirstVerse;
};
