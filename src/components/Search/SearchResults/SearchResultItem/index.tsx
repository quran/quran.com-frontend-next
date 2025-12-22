/* eslint-disable max-lines */
/* eslint-disable react/no-danger */
import React, { useContext } from 'react';

import classNames from 'classnames';
import { NextRouter, useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import SearchResultItemIcon from '../SearchResultItemIcon';

import styles from './SearchResultItem.module.scss';

import DataContext from '@/contexts/DataContext';
import Link from '@/dls/Link/Link';
import Language from '@/types/Language';
import QueryParam from '@/types/QueryParam';
import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { Direction, toLocalizedVerseKey } from '@/utils/locale';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';
import { getResultType, getResultSuffix, getSearchNavigationResult } from '@/utils/search';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import ChaptersData from 'types/ChaptersData';

interface Props {
  source: SearchQuerySource;
  service: SearchService;
  result: SearchNavigationResult;
  arabicChaptersData?: ChaptersData;
}

/**
 * Check if the current URL and target URL are the same
 *
 * @param {string} currentPath - Current router path
 * @param {string} targetUrl - Target URL to compare against
 * @returns {boolean} True if URLs are the same
 */
const isSameUrl = (currentPath: string, targetUrl: string): boolean => {
  const currentUrl = new URL(currentPath, window.location.origin);
  const target = new URL(targetUrl, window.location.origin);

  return (
    currentUrl.pathname === target.pathname &&
    currentUrl.searchParams.get(QueryParam.STARTING_VERSE) ===
      target.searchParams.get(QueryParam.STARTING_VERSE)
  );
};

/**
 * Force scroll to verse by temporarily removing and re-adding the startingVerse param
 */
const forceScrollToVerse = (router: NextRouter, verseNumber: string): void => {
  const queryWithoutStartingVerse = { ...router.query };
  delete queryWithoutStartingVerse[QueryParam.STARTING_VERSE];

  router
    .replace(
      {
        pathname: router.pathname,
        query: queryWithoutStartingVerse,
      },
      undefined,
      { shallow: true },
    )
    .then(() => {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...queryWithoutStartingVerse, [QueryParam.STARTING_VERSE]: verseNumber },
        },
        undefined,
        { shallow: true },
      );
    });
};

const SearchResultItem: React.FC<Props> = ({ source, service, result, arabicChaptersData }) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const router = useRouter();
  const type = getResultType(result);

  const {
    name,
    key: resultKey,
    isArabic,
  } = getSearchNavigationResult(chaptersData, result, t, lang);
  // Extract surah number from result key
  const resultKeyString = String(resultKey);
  const [surahNumber] = getVerseAndChapterNumbersFromKey(resultKeyString);
  const chapterData = surahNumber ? getChapterData(chaptersData, surahNumber) : undefined;
  // Get the arabic name of the surah
  const arabicChapterData =
    arabicChaptersData && surahNumber ? getChapterData(arabicChaptersData, surahNumber) : undefined;
  const arabicSurahName = arabicChapterData?.nameArabic || arabicChapterData?.translatedName;

  // Prepare meta parts for bilingual display
  const arabicMetaParts =
    result.resultType === SearchNavigationType.SURAH
      ? []
      : ([arabicSurahName, toLocalizedVerseKey(resultKeyString, Language.AR)].filter(
          Boolean,
        ) as string[]);

  const translationMetaParts =
    result.resultType === SearchNavigationType.SURAH
      ? []
      : ([
          chapterData?.transliteratedName,
          chapterData?.translatedName,
          toLocalizedVerseKey(resultKeyString, lang),
        ].filter(Boolean) as string[]);

  // Only show bilingual if we have an ayah or surah result with arabic text
  const isArabicSearchResult = result.isArabic ?? false;
  const isBilingualResult =
    (result.resultType === SearchNavigationType.AYAH ||
      result.resultType === SearchNavigationType.SURAH) &&
    !!result?.arabic &&
    !isArabic &&
    !isArabicSearchResult;

  // The translation text is in the name field, but it includes a suffix for verse results
  const shouldIncludeSuffixInName = [
    SearchNavigationType.AYAH,
    SearchNavigationType.TRANSLITERATION,
    SearchNavigationType.TRANSLATION,
    SearchNavigationType.SURAH,
  ].includes(result.resultType);
  const translationSuffix = shouldIncludeSuffixInName
    ? getResultSuffix(type, resultKeyString, lang, chaptersData)
    : '';
  const suffixToRemove = translationSuffix ? ` ${translationSuffix}` : '';
  const translationBase =
    suffixToRemove && name.endsWith(suffixToRemove) ? name.slice(0, -suffixToRemove.length) : name;

  // Build the final translation text with suffix if applicable
  const translationText =
    result.resultType === SearchNavigationType.SURAH && chapterData?.translatedName
      ? `${translationBase} (${chapterData.translatedName}) ${translationSuffix}`.trim()
      : translationBase;

  // For surah results, show arabic surah name + chapter number
  // For ayah results, show arabic text + verse key
  const arabicText =
    result.resultType === SearchNavigationType.SURAH && surahNumber
      ? `${result.arabic} - ${toLocalizedVerseKey(resultKeyString, Language.AR)}`
      : result.arabic || name;

  const joinMetaParts = (parts: string[]) => parts.join(' · ');

  const url = resolveUrlBySearchNavigationType(type, resultKey, true);

  const onResultItemClicked = (e: React.MouseEvent) => {
    logButtonClick(`search_result_item`, {
      service,
      source,
    });

    // Check if we're navigating to the same URL as current page
    if (isSameUrl(router.asPath, url)) {
      e.preventDefault(); // Prevent navigation

      // For verse-type search results, extract verse number and trigger scroll
      if (
        type === SearchNavigationType.AYAH ||
        type === SearchNavigationType.TRANSLITERATION ||
        type === SearchNavigationType.TRANSLATION
      ) {
        const [, verseNumber] = getVerseAndChapterNumbersFromKey(resultKey as string);
        forceScrollToVerse(router, verseNumber);
      }
    }
  };

  return (
    <div className={styles.container} translate="no">
      <Link href={url} onClick={onResultItemClicked} className={styles.linkContainer}>
        <div className={styles.iconContainer}>
          <SearchResultItemIcon type={type} />
        </div>
        <div className={styles.textWrapper}>
          {isBilingualResult ? (
            <>
              <div className={styles.columns}>
                <div className={styles.translationColumn}>
                  <div
                    className={classNames(styles.resultText, styles.translationText)}
                    dir={Direction.LTR}
                    lang={lang}
                    dangerouslySetInnerHTML={{ __html: translationText }}
                  />
                </div>
                <div className={styles.arabicColumn} dir={Direction.RTL} lang={Language.AR}>
                  <div
                    className={classNames(styles.resultText, styles.arabic, styles.languageText)}
                    dir={Direction.RTL}
                    lang={Language.AR}
                    dangerouslySetInnerHTML={{ __html: arabicText }}
                  />
                </div>
              </div>
              {(translationMetaParts.length > 0 || arabicMetaParts.length > 0) && (
                <div className={styles.metaRow}>
                  {translationMetaParts.length > 0 && (
                    <span className={styles.metaItem}>{joinMetaParts(translationMetaParts)}</span>
                  )}
                  {arabicMetaParts.length > 0 && (
                    <span className={classNames(styles.metaItem, styles.metaItemArabic)}>
                      {joinMetaParts(arabicMetaParts)}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div
              className={classNames(styles.resultText, {
                [styles.arabic]: isArabic,
              })}
              dir={isArabic ? Direction.RTL : undefined}
              lang={isArabic ? Language.AR : undefined}
              dangerouslySetInnerHTML={{
                __html: `${name}`,
              }}
            />
          )}
        </div>
      </Link>
    </div>
  );
};
export default SearchResultItem;
