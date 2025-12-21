/* eslint-disable react/no-danger */
import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './CommandPrefix.module.scss';

import SearchResultItemIcon from '@/components/Search/SearchResults/SearchResultItemIcon';
import Language from '@/types/Language';
import { getChapterData } from '@/utils/chapter';
import { Direction, toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { formatStringNumber } from '@/utils/number';
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
  const { t } = useTranslation('common');

  const getContent = () => {
    if (type === SearchNavigationType.SEARCH_PAGE) {
      return t('search-for', {
        searchQuery: name,
      });
    }

    return name;
  };

  const commandKeyString = String(commandKey);

  // Extract the surah number from the verse key
  const [surahNumber] = commandKeyString.split(':');

  // Convert the surah number to Arabic numerals for display
  const surahNumberArabic = surahNumber
    ? toLocalizedNumber(Number(surahNumber), Language.AR)
    : undefined;

  // Get the Arabic name of the surah from the chapters data
  const formattedSurahNumber = surahNumber ? formatStringNumber(surahNumber) : undefined;
  const arabicChapterData =
    arabicChaptersData && formattedSurahNumber
      ? getChapterData(arabicChaptersData, formattedSurahNumber)
      : undefined;
  const arabicSurahName = arabicChapterData?.nameArabic ?? arabicChapterData?.translatedName;

  // Convert the verse key to localized Arabic format
  const surahVerseKey = toLocalizedVerseKey(commandKeyString, Language.AR);

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
        </div>
        {showArabicColumn && (
          <div className={classNames({ [styles.arabicText]: !!arabicLine })}>
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
