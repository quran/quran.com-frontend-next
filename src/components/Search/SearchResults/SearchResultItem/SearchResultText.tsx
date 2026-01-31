/* eslint-disable max-lines */
import React, { useContext } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import searchResultTextStyles from './SearchResultText.module.scss';
import {
  buildResultRowText,
  determineLayoutProps,
  getSurahDisplayText,
  getVerseTextData,
} from './searchResultTextHelpers';

import DataContext from '@/contexts/DataContext';
import useGetChaptersData from '@/hooks/useGetChaptersData';
import Language from '@/types/Language';
import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';
import { Direction } from '@/utils/locale';
import { getSearchNavigationResult } from '@/utils/search';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';
import ChaptersData from 'types/ChaptersData';

export type SearchResultTextClasses = {
  textWrapper: string;
  columns: string;
  translationColumn: string;
  arabicColumn: string;
  resultText: string;
  translationText?: string;
  arabic?: string;
  languageText?: string;
};

type Props = {
  result: SearchNavigationResult;
  classes?: SearchResultTextClasses;
  arabicChaptersData?: ChaptersData;
  /**
   * Whether to transform the result (normalize into a display-ready SearchNavigationResult).
   * Usually true, except when rendering the SEARCH_PAGE row.
   */
  shouldTransform?: boolean;
  /**
   * Which HTML tag to use for the text line.
   */
  textTag?: keyof JSX.IntrinsicElements;
};

/**
 * SearchResultText
 *
 * Displays the main text for a search result row:
 * - Surah results: `number. transliteration (translation if different)`
 * - Ayah results: Arabic verse (with Arabic surah + key) stacked above the translation line
 * - Fallback: single-line name (e.g., Search Page row)
 *
 * @returns {JSX.Element} The rendered component
 */
const SearchResultText: React.FC<Props> = ({
  result,
  classes,
  shouldTransform = true,
  textTag = 'div',
  arabicChaptersData: arabicChaptersDataProp,
}) => {
  const { t, lang } = useTranslation('common');
  // Arabic chapter data needed for Arabic surah names in bilingual display
  const arabicChaptersDataFromHook = useGetChaptersData(Language.AR);
  const arabicChaptersData = arabicChaptersDataProp ?? arabicChaptersDataFromHook;
  // User's locale chapter data for transliterated names
  const chaptersData = useContext(DataContext);
  const textClasses = (classes || searchResultTextStyles) as SearchResultTextClasses;

  const TextTag = textTag;

  // Normalize the result
  // Transform raw API result into display-ready format (skip for SEARCH_PAGE)
  const shouldTransformResult =
    shouldTransform && result.resultType !== SearchNavigationType.SEARCH_PAGE;
  const normalizedResult = shouldTransformResult
    ? getSearchNavigationResult(chaptersData, result, t, lang)
    : result;

  // Extract key properties from normalized result
  const { key: resultKey, isArabic, arabic } = normalizedResult;
  const isArabicResult = isArabic ?? false;
  const resultKeyString = String(resultKey ?? '');

  // Compute derived values
  // Get surah number from key (e.g., "1:5" -> "1")
  const [surahNumber] = getVerseAndChapterNumbersFromKey(resultKeyString);

  // Base display name from the result
  const baseName = normalizedResult.name;

  // For SURAH results: format as "1. Al-Fatihah (The Opener)"
  const surahDisplayText = getSurahDisplayText(
    normalizedResult,
    surahNumber,
    baseName,
    chaptersData,
    lang,
  );

  // For AYAH results: get suffix parts like ["الفاتحة", "١:١"] for Arabic line
  const { isAyahResult, arabicSuffixParts, translationSuffixParts } = getVerseTextData(
    normalizedResult,
    resultKeyString,
    surahNumber,
    arabicChaptersData,
    chaptersData,
    lang,
  );

  // Build final display text lines
  const { arabicLine, translationLine, singleLineText, isSearchPage, isSurahResult } =
    buildResultRowText(
      normalizedResult,
      baseName,
      surahDisplayText,
      arabic,
      isAyahResult,
      arabicSuffixParts,
      translationSuffixParts,
      t,
    );

  // Show bilingual (Arabic + Translation stacked) only for Ayah results with Arabic content
  const isBilingualResult = isAyahResult && !!arabicLine && !isArabicResult;

  // Determine text direction (LTR/RTL) and language attributes
  const { translationDir, singleLineDirection, singleLineLanguage } = determineLayoutProps(
    isArabicResult,
    isSurahResult,
    isSearchPage,
    isArabic,
    lang,
  );

  // RENDER
  // Two layouts:
  // 1. Bilingual: Arabic line stacked above translation line (for Ayah results)
  // 2. Single line: Just the text (for Surah, Page, Juz, Search Page, etc.)
  return (
    <div className={classNames(textClasses.textWrapper)}>
      {isBilingualResult ? (
        // Bilingual layout: Arabic on top, translation below
        <div className={textClasses.columns}>
          <div className={textClasses.arabicColumn} dir={Direction.RTL} lang={Language.AR}>
            <TextTag
              className={classNames(
                textClasses.resultText,
                textClasses.arabic,
                textClasses.languageText,
              )}
              dir={Direction.RTL}
              lang={Language.AR}
              dangerouslySetInnerHTML={{ __html: arabicLine ?? '' }}
            />
          </div>
          <div className={textClasses.translationColumn}>
            <TextTag
              className={classNames(textClasses.resultText, textClasses.translationText)}
              dir={translationDir}
              lang={lang}
              dangerouslySetInnerHTML={{ __html: translationLine ?? '' }}
            />
          </div>
        </div>
      ) : (
        // Single line layout
        <TextTag
          className={classNames(textClasses.resultText, isArabic && textClasses.arabic)}
          dir={singleLineDirection}
          lang={singleLineLanguage}
          dangerouslySetInnerHTML={{ __html: singleLineText ?? '' }}
        />
      )}
    </div>
  );
};

export default SearchResultText;
