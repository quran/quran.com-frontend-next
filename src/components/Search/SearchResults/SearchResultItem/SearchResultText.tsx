/* eslint-disable max-lines */
import React, { useCallback, useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import searchResultItemStyles from './SearchResultItem.module.scss';

import DataContext from '@/contexts/DataContext';
import Language from '@/types/Language';
import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';
import { getChapterData } from '@/utils/chapter';
import { Direction, toLocalizedVerseKey } from '@/utils/locale';
import { getResultSuffix, getResultType, getSearchNavigationResult } from '@/utils/search';
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
  metaRow?: string;
  metaItem?: string;
  metaItemArabic?: string;
};

type Props = {
  result: SearchNavigationResult;
  arabicChaptersData?: ChaptersData;
  classes?: SearchResultTextClasses;
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
 * - Either as bilingual (translation + Arabic side-by-side) for ayah/surah results
 * - Or as a single-line display (e.g., Search Page row)
 *
 * @returns {JSX.Element} The rendered component
 */
const SearchResultText: React.FC<Props> = ({
  result,
  arabicChaptersData,
  classes,
  shouldTransform = true,
  textTag = 'div',
}) => {
  const { t, lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const textClasses = (classes || searchResultItemStyles) as SearchResultTextClasses;

  const TextTag = textTag;

  /**
   * Normalization of the result for display
   */
  const normalizedResult = useMemo(() => {
    const shouldTransformResult =
      shouldTransform && result.resultType !== SearchNavigationType.SEARCH_PAGE;

    return shouldTransformResult
      ? getSearchNavigationResult(chaptersData, result, t, lang)
      : result;
  }, [chaptersData, result, shouldTransform, t, lang]);

  const { name, key: resultKey, isArabic } = normalizedResult;
  const resultKeyString = String(resultKey);

  // Get surah number for additional context
  const [surahNumber] = useMemo(
    () => getVerseAndChapterNumbersFromKey(resultKeyString),
    [resultKeyString],
  );

  // Get chapter data for meta info (surah translation & transliteration)
  const chapterData = useMemo(() => {
    return surahNumber ? getChapterData(chaptersData, surahNumber) : undefined;
  }, [chaptersData, surahNumber]);

  const arabicChapterData = useMemo(() => {
    return arabicChaptersData && surahNumber
      ? getChapterData(arabicChaptersData, surahNumber)
      : undefined;
  }, [arabicChaptersData, surahNumber]);

  const arabicSurahName = arabicChapterData?.nameArabic || arabicChapterData?.translatedName;

  // Get result type
  const type = useMemo(() => getResultType(result), [result]);
  const isSearchPage = result.resultType === SearchNavigationType.SEARCH_PAGE;
  const isSurahResult = result.resultType === SearchNavigationType.SURAH;

  const isAyahResult = useMemo(() => {
    return [
      SearchNavigationType.AYAH,
      SearchNavigationType.TRANSLITERATION,
      SearchNavigationType.TRANSLATION,
    ].includes(result.resultType);
  }, [result.resultType]);

  /**
   * Some results return Arabic text in result.arabic, but the normalized result might already be Arabic-only.
   * We consider it bilingual when:
   * - it's an ayah/surah result
   * - there is Arabic text provided
   * - the normalized display isn't Arabic-only
   * - and the search itself isn't Arabic-only (result.isArabic)
   */
  const isArabicSearchResult = result.isArabic ?? false;
  const isBilingualResult = useMemo(() => {
    return (
      (isAyahResult || isSurahResult) && !!result?.arabic && !isArabic && !isArabicSearchResult
    );
  }, [isAyahResult, isSurahResult, result?.arabic, isArabic, isArabicSearchResult]);

  // Display text + meta
  const displayName = useMemo(() => {
    if (!isSearchPage) return name;
    return t('search-for', { searchQuery: name });
  }, [isSearchPage, name, t]);

  /**
   * When the result type has a suffix (e.g. verse key info), normalize the translation text
   * so we can avoid duplicate suffixes or weird formatting.
   */
  const translationText = useMemo(() => {
    const shouldIncludeSuffixInName = [
      SearchNavigationType.AYAH,
      SearchNavigationType.TRANSLITERATION,
      SearchNavigationType.TRANSLATION,
      SearchNavigationType.SURAH,
    ].includes(type);

    const suffix = shouldIncludeSuffixInName
      ? getResultSuffix(type, resultKeyString, lang, chaptersData)
      : '';
    const suffixToRemove = suffix ? ` ${suffix}` : '';

    const base =
      suffixToRemove && name.endsWith(suffixToRemove)
        ? name.slice(0, -suffixToRemove.length)
        : name;

    if (isSurahResult && chapterData?.translatedName) {
      return `${base} (${chapterData.translatedName}) ${suffix}`.trim();
    }

    return base;
  }, [type, resultKeyString, lang, chaptersData, name, isSurahResult, chapterData?.translatedName]);

  // Get Arabic text, adding verse key for surah results
  const arabicText = useMemo(() => {
    if (isSurahResult && surahNumber) {
      return `${result.arabic} - ${toLocalizedVerseKey(resultKeyString, Language.AR)}`;
    }
    return result.arabic || name;
  }, [isSurahResult, surahNumber, result.arabic, resultKeyString, name]);

  // Meta info parts for translation
  const translationMetaParts = useMemo(() => {
    if (isSurahResult) return [];

    return [
      chapterData?.transliteratedName,
      chapterData?.translatedName,
      toLocalizedVerseKey(resultKeyString, lang),
    ].filter(Boolean) as string[];
  }, [
    isSurahResult,
    chapterData?.transliteratedName,
    chapterData?.translatedName,
    resultKeyString,
    lang,
  ]);

  // Meta info parts for Arabic
  const arabicMetaParts = useMemo(() => {
    if (isSurahResult) return [];

    return [arabicSurahName, toLocalizedVerseKey(resultKeyString, Language.AR)].filter(
      Boolean,
    ) as string[];
  }, [isSurahResult, arabicSurahName, resultKeyString]);

  const shouldRenderMetaRow = translationMetaParts.length > 0 || arabicMetaParts.length > 0;

  const joinMetaParts = useCallback((parts: string[]) => parts.join(' · '), []);

  // Helper to determine text direction and language
  const direction = useMemo<Direction | undefined>(() => {
    if (isArabic) return Direction.RTL;
    if (isSearchPage) return Direction.LTR;
    return undefined;
  }, [isArabic, isSearchPage]);

  const language = useMemo<Language | undefined>(() => {
    if (isArabic) return Language.AR;
    if (isSearchPage) return Language.EN;
    return undefined;
  }, [isArabic, isSearchPage]);

  return (
    <div className={textClasses.textWrapper}>
      {isBilingualResult ? (
        <>
          <div className={textClasses.columns}>
            <div className={textClasses.translationColumn}>
              <TextTag
                className={classNames(textClasses.resultText, textClasses.translationText)}
                dir={Direction.LTR}
                lang={lang}
                dangerouslySetInnerHTML={{ __html: translationText }}
              />
            </div>

            <div className={textClasses.arabicColumn} dir={Direction.RTL} lang={Language.AR}>
              <TextTag
                className={classNames(
                  textClasses.resultText,
                  textClasses.arabic,
                  textClasses.languageText,
                )}
                dir={Direction.RTL}
                lang={Language.AR}
                dangerouslySetInnerHTML={{ __html: arabicText }}
              />
            </div>
          </div>

          {shouldRenderMetaRow && (
            <div className={textClasses.metaRow}>
              {translationMetaParts.length > 0 && (
                <span className={textClasses.metaItem}>{joinMetaParts(translationMetaParts)}</span>
              )}
              {arabicMetaParts.length > 0 && (
                <span className={classNames(textClasses.metaItem, textClasses.metaItemArabic)}>
                  {joinMetaParts(arabicMetaParts)}
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <TextTag
          className={classNames(textClasses.resultText, isArabic && textClasses.arabic)}
          dir={direction}
          lang={language}
          dangerouslySetInnerHTML={{ __html: displayName }}
        />
      )}
    </div>
  );
};

export default SearchResultText;
