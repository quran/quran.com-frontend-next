/* eslint-disable max-lines */
import React, { useContext, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import searchResultTextStyles from './SearchResultText.module.scss';

import DataContext from '@/contexts/DataContext';
import Language from '@/types/Language';
import {
  SearchNavigationResult,
  SearchNavigationType,
} from '@/types/Search/SearchNavigationResult';
import { getChapterData } from '@/utils/chapter';
import { Direction, isRTLLocale, toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
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

const normalizeNameForComparison = (value?: string) => value?.trim().toLowerCase();

/**
 * Determines whether to include the translated name based on whether there are differences
 * between the transliterated and translated names.
 * @param {string} transliteratedName The name in its transliterated form.
 * @param {string} translatedName The name in its translated form.
 * @returns {boolean} Whether the translated name should be included.
 */
const shouldIncludeTranslatedName = (
  transliteratedName?: string,
  translatedName?: string,
): boolean => {
  const normalizedTransliteration = normalizeNameForComparison(transliteratedName);
  const normalizedTranslation = normalizeNameForComparison(translatedName);
  return !!translatedName && normalizedTranslation !== normalizedTransliteration;
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
  arabicChaptersData,
  classes,
  shouldTransform = true,
  textTag = 'div',
}) => {
  const { t, lang } = useTranslation('common');
  const chaptersData = useContext(DataContext);
  const textClasses = (classes || searchResultTextStyles) as SearchResultTextClasses;

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

  const { name, key: resultKey, isArabic, arabic } = normalizedResult;
  const isArabicResult = isArabic ?? false;
  const resultKeyString = String(resultKey ?? '');

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

  const transliteratedName = chapterData?.transliteratedName;
  const translatedName = chapterData?.translatedName;
  const shouldShowTranslatedName = useMemo(
    () => shouldIncludeTranslatedName(transliteratedName, translatedName),
    [transliteratedName, translatedName],
  );

  const arabicSurahName = arabicChapterData?.nameArabic || arabicChapterData?.translatedName;

  // Get result type
  const type = useMemo(() => getResultType(result), [result]);
  const isSearchPage = result.resultType === SearchNavigationType.SEARCH_PAGE;
  const isSurahResult = type === SearchNavigationType.SURAH;
  const isAyahResult = useMemo(() => {
    return [
      SearchNavigationType.AYAH,
      SearchNavigationType.TRANSLITERATION,
      SearchNavigationType.TRANSLATION,
    ].includes(type);
  }, [type]);

  // Strip the default suffix the search utils add
  const resultSuffix = useMemo(() => {
    const shouldIncludeSuffix = isSurahResult || isAyahResult;
    return shouldIncludeSuffix ? getResultSuffix(type, resultKeyString, lang, chaptersData) : '';
  }, [chaptersData, isAyahResult, isSurahResult, lang, resultKeyString, type]);

  const baseName = useMemo(() => {
    if (!resultSuffix) return name;
    const suffixToRemove = ` ${resultSuffix}`;
    return name.endsWith(suffixToRemove) ? name.slice(0, -suffixToRemove.length) : name;
  }, [name, resultSuffix]);

  /**
   * Surah label follows this format:
   * `number. transliteration (translation if different)`
   */
  const surahDisplayText = useMemo(() => {
    if (!isSurahResult) return undefined;
    const localizedSurahNumber = surahNumber
      ? toLocalizedNumber(Number(surahNumber), lang)
      : undefined;
    const translatedLabel = shouldShowTranslatedName ? translatedName : undefined;
    const translatedSuffix = translatedLabel ? ` (${translatedLabel})` : '';
    const surahLabel = transliteratedName || baseName;
    const surahPrefix = localizedSurahNumber ? `${localizedSurahNumber}. ` : '';

    return `${surahPrefix}${surahLabel}${translatedSuffix}`.trim();
  }, [
    baseName,
    isSurahResult,
    lang,
    shouldShowTranslatedName,
    surahNumber,
    translatedName,
    transliteratedName,
  ]);

  // Arabic + localized verse keys
  const arabicVerseKey = useMemo(
    () => (resultKeyString ? toLocalizedVerseKey(resultKeyString, Language.AR) : ''),
    [resultKeyString],
  );
  const localizedVerseKey = useMemo(
    () => (resultKeyString ? toLocalizedVerseKey(resultKeyString, lang) : ''),
    [resultKeyString, lang],
  );

  // Build the suffixes that get appended to the verse lines
  const arabicSuffixParts = useMemo(() => {
    if (!isAyahResult) return [];
    return [arabicSurahName, arabicVerseKey].filter(Boolean) as string[];
  }, [arabicSurahName, arabicVerseKey, isAyahResult]);

  const translationSuffixParts = useMemo(() => {
    if (!isAyahResult) return [];
    return [transliteratedName, localizedVerseKey].filter(Boolean) as string[];
  }, [isAyahResult, localizedVerseKey, transliteratedName]);

  // Lines to render (kept separate to make the stacked layout easier to follow)
  const arabicLine = useMemo(() => {
    if (!isAyahResult || !arabic) return undefined;
    if (!arabicSuffixParts.length) return arabic;
    return `${arabic} (${arabicSuffixParts.join(' ')})`;
  }, [arabic, arabicSuffixParts, isAyahResult]);

  const translationLine = useMemo(() => {
    if (isSurahResult) return surahDisplayText || baseName;
    if (!isAyahResult) return baseName;
    const suffixText = translationSuffixParts.length
      ? ` (${translationSuffixParts.join(' ')})`
      : '';
    return `${baseName}${suffixText}`;
  }, [baseName, isAyahResult, isSurahResult, surahDisplayText, translationSuffixParts]);

  // Arabic-only results already contain Arabic in the "translation" line; show a single column so
  // we keep the transliterated surah suffix and avoid duplicate Arabic content.
  const isBilingualResult = isAyahResult && !!arabicLine && !isArabicResult;

  // Display text + fallback
  const singleLineText = useMemo(() => {
    if (isSearchPage) return t('search-for', { searchQuery: name });
    if (isSurahResult) return surahDisplayText || baseName;
    return translationLine;
  }, [baseName, isSearchPage, isSurahResult, name, surahDisplayText, t, translationLine]);

  // Helper to determine text direction and language
  const translationDir = useMemo(() => {
    // Keep translation column LTR on Arabic UI unless the result itself is Arabic or this is a surah label.
    if (lang === Language.AR && !isArabicResult && !isSurahResult) return Direction.LTR;
    return isRTLLocale(lang) ? Direction.RTL : Direction.LTR;
  }, [isArabicResult, isSurahResult, lang]);
  const singleLineDirection = useMemo(() => {
    if (isArabic) return Direction.RTL;
    return translationDir;
  }, [isArabic, translationDir]);

  const singleLineLanguage = useMemo(() => {
    if (isArabic) return Language.AR;
    if (isSearchPage) return Language.EN;
    return lang as Language;
  }, [isArabic, isSearchPage, lang]);

  return (
    <div className={classNames(textClasses.textWrapper)}>
      {isBilingualResult ? (
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
