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
    // eslint-disable-next-line react-func/max-lines-per-function
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const selection = document.getSelection();
      if (!selection || selection.isCollapsed) {
        return;
      }

      const verseElement = event.currentTarget;
      const selectedNodes = Array.from(
        verseElement.querySelectorAll<HTMLElement>('[data-word-index]'),
      ).filter((node) => selection.containsNode(node, true));

      if (!selectedNodes.length) {
        return;
      }

      event.preventDefault();

      const textFieldName = getWordTextFieldNameByFont(quranFont);
      const copiedText = selectedNodes
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

          const wordText =
            word[textFieldName] ?? word.text ?? word.textUthmani ?? word.qpcUthmaniHafs ?? '';

          return typeof wordText === 'string' ? wordText.trim() : '';
        })
        .filter((wordText) => wordText.length > 0);

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
