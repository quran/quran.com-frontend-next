import AudioPlayerContext from './types/AudioPlayerContext';

import isCurrentTimeInRange from '@/components/AudioPlayer/hooks/isCurrentTimeInRange';
import { getVerseNumberFromKey } from '@/utils/verse';
import { getAvailableReciters, getChapterAudioData } from 'src/api';
import AudioData from 'types/AudioData';
import Reciter from 'types/Reciter';
import VerseTiming from 'types/VerseTiming';
import Word from 'types/Word';

export const getAyahNumberByTimestamp = (verseTimings: VerseTiming[], timestamp: number) => {
  const verseTiming = verseTimings.find(
    (timing) => timestamp >= timing.timestampFrom && timestamp <= timing.timestampTo,
  );
  if (!verseTiming) return null;
  return getVerseNumberFromKey(verseTiming.verseKey);
};

/**
 * There's an issue on mobile safari. Where the audio doesn't start from the correct timestamp.
 * For example
 * verse 1: timestamp : 0 - 1000ms;
 * verse 2: timestamp: 1000ms - 2000ms;
 *
 * When we seek to verse timestamp 1000ms, safari reports that the timestamp is 850ms.
 * And the UI highlights verse 1. Which is incorrect. Since the user intended to play verse 2 (timestamp 1000)
 *
 */
const TOLERANCE_PERIOD = 200; // ms

export const getActiveVerseTiming = (context) => {
  const {
    audioData: { verseTimings },
    ayahNumber,
  } = context;
  const { currentTime } = context.audioPlayer;
  const currentTimeMS = currentTime * 1000;
  const lastAyahOfSurahTimestampTo = verseTimings[verseTimings.length - 1].timestampTo;

  // if the reported time exceeded the maximum timestamp of the Surah from BE, just return the current Ayah which should be the last
  if (currentTimeMS > lastAyahOfSurahTimestampTo - TOLERANCE_PERIOD) {
    return verseTimings[ayahNumber - 1];
  }

  const activeVerseTiming = verseTimings.find((ayah) => {
    const isAyahBeingRecited = isCurrentTimeInRange(
      currentTimeMS,
      ayah.timestampFrom - TOLERANCE_PERIOD,
      ayah.timestampTo - TOLERANCE_PERIOD,
    );
    return isAyahBeingRecited;
  });

  return activeVerseTiming;
};

export const getActiveWordLocation = (activeVerseTiming: VerseTiming, currentTime: number) => {
  const activeAudioSegment = activeVerseTiming.segments.find((segment) => {
    const [, timestampFrom, timestampTo] = segment; // the structure of the segment is: [wordLocation, timestampFrom, timestampTo]
    return isCurrentTimeInRange(currentTime, timestampFrom, timestampTo);
  });

  const wordLocation = activeAudioSegment ? activeAudioSegment[0] : 0;
  return wordLocation;
};

const getTimingSegment = (verseTiming: VerseTiming, wordPosition: number) =>
  verseTiming.segments.find(([location]) => wordPosition === location);

export const getWordTimeSegment = (verseTimings: VerseTiming[], word: Word) => {
  const verseTiming = verseTimings.find((timing) => timing.verseKey === word.verseKey);
  if (!verseTiming) return null;
  const segment = getTimingSegment(verseTiming, word.position);
  if (segment) return [segment[1], segment[2]];
  return null;
};

export const getActiveAyahNumber = (activeVerseTiming?: VerseTiming) => {
  const [, verseNumber] = activeVerseTiming.verseKey.split(':');
  return Number(verseNumber);
};

export const executeFetchReciter = async (context: AudioPlayerContext): Promise<AudioData> => {
  const { reciterId, surah } = context;
  return getChapterAudioData(reciterId, surah, true);
};

export const executeFetchReciterFromEvent = async (
  context: AudioPlayerContext,
  event,
): Promise<AudioData> => {
  const { surah } = event;
  const { reciterId } = context;
  // @ts-ignore
  const data = await executeFetchReciter({ reciterId, surah });
  return {
    ...data,
    ...event,
  };
};

export const getMediaSessionMetaData = async (
  context: AudioPlayerContext,
  recitersList: Reciter[],
) => {
  const reciterName = recitersList.find(
    (reciter) => reciter.id === context.audioData.reciterId,
  ).name;
  return new MediaMetadata({
    title: `Surah ${context.audioData.chapterId}`,
    artist: reciterName,
    album: 'Quran.com',
    artwork: [
      {
        src: 'https://quran.com/images/logo/Logo@192x192.png',
        type: 'image/png',
        sizes: '192x192',
      },
    ],
  });
};

export const getRecitersList = async (context: AudioPlayerContext) => {
  const { recitersList } = context;
  if (recitersList) return recitersList;
  // TODO: localize this
  return getAvailableReciters('en').then((res) => res.reciters);
};
