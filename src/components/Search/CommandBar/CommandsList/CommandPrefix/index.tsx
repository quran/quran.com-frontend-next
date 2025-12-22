/* eslint-disable react/no-danger */
import React, { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPrefix.module.scss';

import SearchResultItemIcon from '@/components/Search/SearchResults/SearchResultItemIcon';
import DataContext from '@/contexts/DataContext';
import Language from '@/types/Language';
import { getChapterData } from '@/utils/chapter';
import { Direction, toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { formatStringNumber } from '@/utils/number';
import { getResultSuffix } from '@/utils/search';
import ChaptersData from 'types/ChaptersData';
import { SearchNavigationType } from 'types/Search/SearchNavigationResult';

interface Props {
  name: string;
  type: SearchNavigationType;
  arabic?: string;
  arabicChaptersData?: ChaptersData;
  rawResultType: SearchNavigationType;
  commandKey: number | string;
  isArabic?: boolean;
}

const CommandPrefix: React.FC<Props> = ({
  name,
  type,
  arabic,
  arabicChaptersData,
  rawResultType,
  commandKey,
  isArabic = false,
}) => {
  const { t, lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);

  const commandKeyString = String(commandKey);
  const [surahNumber] = commandKeyString.split(':');
  const surahNumberArabic = surahNumber
    ? toLocalizedNumber(Number(surahNumber), Language.AR)
    : undefined;

  // Get the Arabic name of the surah from the chapters data
  const formattedSurahNumber = surahNumber ? formatStringNumber(surahNumber) : undefined;
  const arabicChapterData =
    arabicChaptersData && formattedSurahNumber
      ? getChapterData(arabicChaptersData, formattedSurahNumber)
      : undefined;
  const chapterData =
    chaptersData && formattedSurahNumber
      ? getChapterData(chaptersData, formattedSurahNumber)
      : undefined;
  const arabicSurahName = arabicChapterData?.nameArabic ?? arabicChapterData?.translatedName;

  const isSurahResult = rawResultType === SearchNavigationType.SURAH;
  const shouldIncludeSuffixInName = [
    SearchNavigationType.AYAH,
    SearchNavigationType.SURAH,
    SearchNavigationType.TRANSLITERATION,
    SearchNavigationType.TRANSLATION,
  ].includes(type);
  const resultSuffix =
    shouldIncludeSuffixInName && chaptersData
      ? getResultSuffix(type, commandKeyString, lang, chaptersData)
      : '';
  const suffixToRemove = resultSuffix ? ` ${resultSuffix}` : '';
  const translationText =
    suffixToRemove && name.endsWith(suffixToRemove) ? name.slice(0, -suffixToRemove.length) : name;
  const translationDisplayText =
    isSurahResult && chapterData?.translatedName
      ? `${translationText} (${chapterData.translatedName}) ${resultSuffix}`
      : translationText;

  // Convert the verse key to localized Arabic format
  const surahVerseKey = toLocalizedVerseKey(commandKeyString, Language.AR);

  const getContent = () => {
    if (type === SearchNavigationType.SEARCH_PAGE) {
      return t('search-for', {
        searchQuery: name,
      });
    }

    return translationDisplayText;
  };

  const surahArabicLabel = arabic || arabicSurahName || '';

  // Build the Arabic text line based on the result type
  let arabicLine = '';

  if (rawResultType === SearchNavigationType.SURAH) {
    // For SURAH results: Show Arabic name followed by the chapter number
    const surahParts = [surahArabicLabel, surahNumberArabic].filter(Boolean);
    arabicLine = surahParts.join(' - ');
  } else if (arabicSurahName) {
    // For AYAH results with Arabic surah name: Show Arabic text + (Surah name + verse key)
    arabicLine = `${arabic}${arabic ? ' ' : ''}(${arabicSurahName} ${surahVerseKey})`;
  } else {
    // Fallback: Use whatever Arabic text is available, or empty string
    arabicLine = arabic || '';
  }

  const isAyah = rawResultType === SearchNavigationType.AYAH;
  const isArabicResult = !!isArabic;
  const showArabicColumn = !isArabicResult && !!arabicLine;
  const translationIsRTL = isAyah || isArabicResult;
  const translationMetaParts: string[] = [];
  if (chapterData && !isSurahResult && rawResultType !== SearchNavigationType.SEARCH_PAGE) {
    if (chapterData.transliteratedName) {
      translationMetaParts.push(chapterData.transliteratedName);
    }
    if (chapterData.translatedName) {
      translationMetaParts.push(chapterData.translatedName);
    }
    if (type !== SearchNavigationType.SURAH) {
      translationMetaParts.push(toLocalizedVerseKey(commandKeyString, lang));
    }
  }
  const translationMeta =
    translationMetaParts.length > 0 ? translationMetaParts.join(' · ') : undefined;

  return (
    <div className={styles.container}>
      <span className={styles.commandPrefix}>
        <SearchResultItemIcon type={type} />
      </span>
      <div className={classNames(styles.columns, { [styles.singleColumn]: !showArabicColumn })}>
        <div className={styles.translationColumn}>
          <p
            className={classNames(styles.name, {
              [styles.rtlText]: translationIsRTL,
            })}
            dir={translationIsRTL ? Direction.RTL : Direction.LTR}
            lang={translationIsRTL ? Language.AR : Language.EN}
            dangerouslySetInnerHTML={{
              __html: getContent(),
            }}
          />
          {translationMeta && (
            <span
              className={styles.translationMeta}
              dir={translationIsRTL ? Direction.RTL : Direction.LTR}
            >
              {translationMeta}
            </span>
          )}
        </div>
        {showArabicColumn && (
          <div className={classNames(styles.arabicColumn, { [styles.arabicText]: !!arabicLine })}>
            {arabicLine && (
              <p
                dir={Direction.RTL}
                lang={Language.AR}
                dangerouslySetInnerHTML={{ __html: arabicLine }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandPrefix;
