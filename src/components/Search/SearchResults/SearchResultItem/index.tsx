/* eslint-disable react/no-danger */
import React, { useContext } from 'react';

import classNames from 'classnames';
import { NextRouter, useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import SearchResultItemIcon from '../SearchResultItemIcon';

import styles from './SearchResultItem.module.scss';

import DataContext from '@/contexts/DataContext';
import Link from '@/dls/Link/Link';
import { setIsExpanded } from '@/redux/slices/CommandBar/state';
import { stopMicrophone } from '@/redux/slices/microphone';
import Language from '@/types/Language';
import QueryParam from '@/types/QueryParam';
import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';
import SearchService from '@/types/Search/SearchService';
import SearchQuerySource from '@/types/SearchQuerySource';
import { logButtonClick } from '@/utils/eventLogger';
import { Direction } from '@/utils/locale';
import { resolveUrlBySearchNavigationType } from '@/utils/navigation';
import { getResultType, getSearchNavigationResult } from '@/utils/search';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

interface Props {
  source: SearchQuerySource;
  service: SearchService;
  result: SearchNavigationResult;
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

const SearchResultItem: React.FC<Props> = ({ source, service, result }) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const router = useRouter();
  const dispatch = useDispatch();
  const type = getResultType(result);

  const {
    name,
    key: resultKey,
    isArabic,
  } = getSearchNavigationResult(chaptersData, result, t, lang);

  const url = resolveUrlBySearchNavigationType(type, resultKey, true);

  const onResultItemClicked = (e: React.MouseEvent) => {
    logButtonClick(`search_result_item`, {
      service,
      source,
    });

    // Stop the microphone if it's active
    dispatch(stopMicrophone());

    // Close the dropdown/search results
    dispatch({ type: setIsExpanded.type, payload: false });

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
      </Link>
    </div>
  );
};
export default SearchResultItem;
