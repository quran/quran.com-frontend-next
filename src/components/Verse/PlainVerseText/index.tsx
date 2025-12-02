/* eslint-disable max-lines */
import React, { useCallback } from 'react';

import classNames from 'classnames';
import clipboardCopy from 'clipboard-copy';
import { shallowEqual, useSelector } from 'react-redux';

import SeoTextForVerse from '../SeoTextForVerse';
import TajweedFontPalettes from '../TajweedFontPalettes';
import styles from '../VerseText.module.scss';

import PlainVerseTextWord from './PlainVerseTextWord';

import useIsFontLoaded from '@/components/QuranReader/hooks/useIsFontLoaded';
import GlyphWord from '@/dls/QuranWord/GlyphWord';
import TextWord from '@/dls/QuranWord/TextWord';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { QuranFont } from '@/types/QuranReader';
import { getFontClassName, isQCFFont } from '@/utils/fontFaceHelper';
import { getWordTextFieldNameByFont } from '@/utils/word';
import Word from 'types/Word';

type Props = {
  words: Word[];
  shouldShowWordByWordTranslation?: boolean;
  shouldShowWordByWordTransliteration?: boolean;
  fontScale?: number;
  titleText?: string;
  quranFont?: QuranFont;
};

/**
 * Gets the selected HTML elements within a verse that have word index data attributes.
 *
 * @returns {HTMLElement[]} Array of HTML elements that are selected
 */
const getSelectedNodes = (
  verseElement: HTMLDivElement,
  selection: Selection | null,
): HTMLElement[] => {
  if (!selection || selection.isCollapsed) {
    return [];
  }
  return Array.from(verseElement.querySelectorAll<HTMLElement>('[data-word-index]')).filter(
    (node) => selection.containsNode(node, true),
  );
};

/**
 * Builds the text content to be copied to clipboard from selected word nodes.
 *
 * @returns {string[]} Array of text strings from the selected words
 */
const buildCopiedText = (selectedNodes: HTMLElement[], words: Word[], textFieldName: string) =>
  selectedNodes
    .filter((node) => !Number.isNaN(Number(node.getAttribute('data-word-index'))))
    .sort(
      (firstNode, secondNode) =>
        Number(firstNode.getAttribute('data-word-index')) -
        Number(secondNode.getAttribute('data-word-index')),
    )
    .map((node) => {
      const index = Number(node.getAttribute('data-word-index'));
      if (Number.isNaN(index)) {
        return '';
      }
      const word = words[index];
      if (!word) {
        return '';
      }

      const wordText = word[textFieldName as keyof Word] ?? '';

      return typeof wordText === 'string' ? wordText.trim() : '';
    })
    .filter((wordText) => wordText.length > 0);

/**
 * A component to only show the verse text without extra functionalities such as ayah
 * highlighting when audio is playing or showing a tooltip when
 * hovering over a verse or showing the word by word translation/transliteration.
 *
 * @param {Props} param0
 * @returns {JSX.Element}
 */
const PlainVerseText: React.FC<Props> = ({
  words,
  shouldShowWordByWordTranslation = false,
  shouldShowWordByWordTransliteration = false,
  fontScale,
  titleText,
  quranFont: quranFontFromProps,
}: Props): JSX.Element => {
  const {
    quranFont: quranFontFromStore,
    quranTextFontScale,
    mushafLines,
  } = useSelector(selectQuranReaderStyles, shallowEqual);
  const quranFont = quranFontFromProps || quranFontFromStore;
  const isQcfFont = isQCFFont(quranFont);
  const { pageNumber } = words[0];
  const isFontLoaded = useIsFontLoaded(pageNumber, quranFont);

  const handleCopy = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const selectedNodes = getSelectedNodes(event.currentTarget, document.getSelection());
      if (!selectedNodes.length) {
        return;
      }

      event.preventDefault();

      const copiedText = buildCopiedText(
        selectedNodes,
        words,
        getWordTextFieldNameByFont(quranFont),
      );

      if (!copiedText.length) {
        return;
      }

      clipboardCopy(copiedText.join(' '));
    },
    [quranFont, words],
  );

  const shouldShowTitle = !!titleText;

  return (
    <>
      <SeoTextForVerse words={words} />
      <TajweedFontPalettes pageNumber={pageNumber} quranFont={quranFont} />
      <div
        data-testid={`wbw-${shouldShowWordByWordTranslation ? 'translation' : 'transliteration'}`}
        className={classNames(
          styles.verseTextContainer,
          styles.tafsirOrTranslationMode,
          styles[getFontClassName(quranFont, fontScale || quranTextFontScale, mushafLines)],
        )}
      >
        {shouldShowTitle && <p className={styles.verseTitleText}>{titleText}</p>}
        <div
          className={classNames(
            styles.verseText,
            styles.verseTextWrap,
            shouldShowTitle ? styles.verseTextCenter : styles.verseTextStart,
          )}
          onCopy={handleCopy}
          translate="no"
        >
          {words?.map((word, wordIndex) => {
            if (isQcfFont) {
              return (
                <PlainVerseTextWord
                  key={word.location}
                  word={word}
                  wordIndex={wordIndex}
                  shouldShowWordByWordTranslation={shouldShowWordByWordTranslation}
                  shouldShowWordByWordTransliteration={shouldShowWordByWordTransliteration}
                >
                  <GlyphWord
                    font={quranFont}
                    qpcUthmaniHafs={word.qpcUthmaniHafs}
                    pageNumber={word.pageNumber}
                    textCodeV1={word.codeV1}
                    textCodeV2={word.codeV2}
                    isFontLoaded={isFontLoaded}
                  />
                </PlainVerseTextWord>
              );
            }
            return (
              <PlainVerseTextWord
                key={word.location}
                word={word}
                wordIndex={wordIndex}
                shouldShowWordByWordTranslation={shouldShowWordByWordTranslation}
                shouldShowWordByWordTransliteration={shouldShowWordByWordTransliteration}
              >
                <TextWord font={quranFont} text={word.text} charType={word.charTypeName} />
              </PlainVerseTextWord>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PlainVerseText;
