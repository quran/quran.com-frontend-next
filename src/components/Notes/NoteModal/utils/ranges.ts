import { getChapterNumberFromKey } from '@/utils/verse';

/* eslint-disable import/prefer-default-export */
export const parseNoteRanges = (ranges: string[]): [string, number, number] => {
  // TODO: this is temporary and assumes that a note has only one range and 1 Ayah inside that range
  const verseKey = ranges[0]?.split('-')?.[0];
  const chapterNumber = getChapterNumberFromKey(verseKey);
  const verseNumber = verseKey?.split(':')?.[1];
  return [verseKey, chapterNumber, Number(verseNumber)];
};
