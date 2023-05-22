/* eslint-disable import/prefer-default-export */
import { Translate } from 'next-translate';

import { DropdownItem } from '@/dls/Forms/Combobox/ComboboxItem';
import { SelectOption } from '@/dls/Forms/Select';
import ChaptersData from '@/types/ChaptersData';
import { getChapterData } from '@/utils/chapter';
import { secondsToReadableFormat } from '@/utils/datetime';
import { toLocalizedNumber } from '@/utils/locale';

const TIME_OPTIONS_LIMIT = 4 * 60; // 4 hours
const DURATION_DAYS_LIMIT = 365; // 1 year, 365 days

/**
 * Generates options for the reading goal time input.
 *
 * The options are within a range of 1 minute to 4 hours.
 * - From 1 to 10 minutes (first 10 options), increment by 1 minute
 * - From > 10 minutes to 4 hours, increment by 5 minutes
 *
 * @param {Translate} t
 * @param {string} locale
 * @returns {SelectOption[]}
 */
export const generateTimeOptions = (t: Translate, locale: string): SelectOption[] => {
  // for the first 10 minutes, we want to show 1 until 10
  // but after that, we want to increment by 5 minutes
  // and our limit is TIME_OPTIONS_LIMIT
  const options: SelectOption[] = new Array(10 + (TIME_OPTIONS_LIMIT - 10) / 5)
    .fill(null)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .map((_, i) => {
      let minutes: number;

      if (i < 10) {
        minutes = i + 1;
      } else {
        minutes = (i - 9) * 5 + 10;
      }

      const seconds = minutes * 60;

      return {
        value: seconds,
        label: secondsToReadableFormat(seconds, t, locale),
      };
    });

  return options;
};

/**
 * Generates options for the reading goal chapter input.
 *
 * @param {ChaptersData} chaptersData
 * @param {string} locale
 * @returns {DropdownItem[]}
 */
export const generateChapterOptions = (
  chaptersData: ChaptersData,
  locale: string,
): DropdownItem[] => {
  const data: DropdownItem[] = Object.keys(chaptersData).map((chapterId) => {
    const chapter = getChapterData(chaptersData, chapterId);
    const localizedChapterId = toLocalizedNumber(Number(chapterId), locale);

    return {
      id: chapterId,
      name: chapterId,
      value: chapterId,
      label: `${localizedChapterId} - ${chapter.transliteratedName}`,
    };
  });

  return data;
};

/**
 * Generates verse options for a certain chapter in the reading goal verse input.
 *
 * @param {ChaptersData} chaptersData
 * @param {Translate} t
 * @param {string} locale
 * @param {string?} chapterId
 * @returns {DropdownItem[]}
 */
export const generateVerseOptions = (
  chaptersData: ChaptersData,
  t: Translate,
  locale: string,
  chapterId?: string,
): DropdownItem[] => {
  if (!chapterId) return [];

  const chapter = getChapterData(chaptersData, chapterId);

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const options: DropdownItem[] = new Array(chapter.versesCount).fill(null).map((_, index) => {
    const localizedVerseId = toLocalizedNumber(index + 1, locale);
    const verseId = String(index + 1);

    return {
      id: verseId,
      name: verseId,
      value: verseId,
      label: `${t('common:ayah')} ${localizedVerseId}`,
    };
  });

  return options;
};

/**
 * Generates options for the reading goal duration input.
 *
 * The options are within a range of 1 day to 365 days in this format:
 * "1 day", "2 days", "3 days", etc...
 *
 * @param {Translate} t
 * @param {string} locale
 * @returns {SelectOption[]}
 */
export const generateDurationDaysOptions = (t: Translate, locale: string): SelectOption[] => {
  // for the first 10 days, we want to show 1 until 10
  // but after that, we want to increment by 5 days
  // and our limit is DURATION_DAYS_LIMIT
  const options: SelectOption[] = new Array(10 + (DURATION_DAYS_LIMIT - 10) / 5)
    .fill(null)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .map((_, i) => {
      let day: number;
      if (i < 10) {
        day = i + 1;
      } else {
        day = (i - 9) * 5 + 10;
      }

      return {
        value: day.toString(),
        label: t('reading-goal:x-days', { count: day, days: toLocalizedNumber(day, locale) }),
      };
    });

  return options;
};
