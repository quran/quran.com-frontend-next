/* eslint-disable max-lines */
/* eslint-disable i18next/no-literal-string */
/* eslint-disable jsdoc/require-returns */
/* eslint-disable no-void */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React from 'react';

import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';
import useSWR from 'swr';

import { SyntaxAnalysisCharts } from './SyntaxChartTables';
import SyntaxTabLayout from './SyntaxTabLayout';
import styles from './SyntaxView.module.scss';
import useSyntaxChartArabicTypography from './useSyntaxChartArabicTypography';

import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { fetchSyntaxAnalysis, getWordTextUthmaniForSyntax } from '@/services/syntaxAnalysisService';
import Word from '@/types/Word';

interface SyntaxBodyProps {
  chapterId: string;
  verseNumber: string;
  selectedWord?: Word;
  scrollToTop: () => void;
}

/**
 * Syntax tab body — layout and font scaling match TafsirBody (tafsirFontScale + generate-font-scales).
 * Morphology JSON comes from `/api/syntax/analyze` (Quran MCP).
 */
const SyntaxBody: React.FC<SyntaxBodyProps> = (props) => {
  const { selectedWord, scrollToTop, chapterId, verseNumber } = props;
  void scrollToTop;
  void chapterId;
  void verseNumber;

  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { tafsirFontScale } = quranReaderStyles;
  const { arabicTypographyStyle, verbTypographyClassName } = useSyntaxChartArabicTypography();

  const wordText = selectedWord ? getWordTextUthmaniForSyntax(selectedWord) : '';
  const verseKey = selectedWord?.verseKey;

  const swrKey =
    selectedWord && wordText
      ? ['syntax-analysis', selectedWord.location ?? '', wordText, verseKey ?? '']
      : null;

  const {
    data: analysis,
    error,
    isValidating,
  } = useSWR(
    swrKey,
    () =>
      fetchSyntaxAnalysis({
        textUthmani: wordText,
        verseKey,
      }),
    { revalidateOnFocus: false },
  );

  const showAnalysisLoading = Boolean(swrKey && isValidating && !analysis && !error);

  let analysisErrorMessage: string | null = null;
  if (error instanceof Error) {
    analysisErrorMessage = error.message;
  } else if (error) {
    analysisErrorMessage = String(error);
  }

  return (
    <SyntaxTabLayout
      selectionControl={null}
      fontType="tafsir"
      body={
        <div className={styles.syntaxPageContainer}>
          <div
            className={classNames(
              styles.syntaxContainer,
              styles[`tafsir-font-size-${tafsirFontScale}`],
            )}
          >
            <h2 className={styles.syntaxSectionTitle}>
              Grammatical Analysis of the word:{' '}
              {wordText ? (
                <span
                  dir="rtl"
                  lang="ar"
                  style={arabicTypographyStyle}
                  className={verbTypographyClassName}
                >
                  {wordText}
                </span>
              ) : (
                <em>No script text on this token — pick a word token.</em>
              )}
            </h2>

            <p className={styles.syntaxMetaRow}>
              {selectedWord?.translation?.text || 'None selected'} -{' '}
              {selectedWord?.transliteration?.text || 'None selected'}
            </p>

            <div className={styles.syntaxAnalysisSection}>
              <h3 className={styles.syntaxAnalysisHeading}>Morphology</h3>
              {!selectedWord && (
                <p className={styles.syntaxMuted}>Select a word in the verse to analyze.</p>
              )}
              {selectedWord && !wordText && (
                <p className={styles.syntaxMuted}>This token has no Uthmani text field.</p>
              )}
              {showAnalysisLoading && <p className={styles.syntaxMuted}>Loading analysis…</p>}
              {analysisErrorMessage && (
                <p className={styles.syntaxError} role="alert">
                  {analysisErrorMessage}
                </p>
              )}
              {analysis && (
                <>
                  <div className={styles.syntaxAnalysisBlock}>
                    <strong>Root letters:</strong>
                    <p lang="ar">
                      <span style={arabicTypographyStyle} className={verbTypographyClassName}>
                        {analysis.rootLetter.rootLetter}
                      </span>
                    </p>
                  </div>
                  <div className={styles.syntaxAnalysisBlock}>
                    <strong>Pattern</strong>
                    <p
                      className={styles.syntaxPatternWordPattern}
                      lang="ar"
                      dir="auto"
                    >
                      {analysis.pattern.wordPattern}
                      {' '}
                      —
                      <span style={arabicTypographyStyle} className={verbTypographyClassName}>
                        {analysis.pattern.patternType}
                      </span>
                    </p>
                  </div>
                  <div className={styles.syntaxAnalysisBlock}>
                    <strong>Word breakdown</strong>
                    <ul className={styles.syntaxBreakdownList}>
                      {analysis.wordBreakDown.map((row, idx) => (
                        <li key={`${row.part}-${idx}`}>
                          <span
                            dir="rtl"
                            lang="ar"
                            style={arabicTypographyStyle}
                            className={verbTypographyClassName}
                          >
                            {row.part}
                          </span>{' '}
                          — {row.meaning}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <SyntaxAnalysisCharts
                    verbChart={analysis.verbChart}
                    verbPresentTenseChart={analysis.verbPresentTenseChart}
                    verbPastTenseChart={analysis.verbPastTenseChart}
                    ismChart={analysis.ismChart}
                    sarfChart={analysis.sarfChart}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      }
    />
  );
};

export default SyntaxBody;
