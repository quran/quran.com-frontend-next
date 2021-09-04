import React, { ReactNode, useState } from 'react';
import Word, { CharType } from 'types/Word';
import { QuranFont, WordByWordType } from 'src/components/QuranReader/types';
import { isQCFFont } from 'src/utils/fontFaceHelper';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { selectReadingPreferences } from 'src/redux/slices/QuranReader/readingPreferences';
import Tooltip, { ContentSide } from 'src/components/dls/Tooltip';
import Wrapper from 'src/components/Wrapper/Wrapper';
import TextWord from './TextWord';
import GlyphWord from './GlyphWord';
import styles from './QuranWord.module.scss';

type QuranWordProps = {
  word: Word;
  font?: QuranFont;
  highlight?: boolean;
  allowWordByWord?: boolean;
};

const getGlyph = (word: Word, font: QuranFont) => {
  if (font === QuranFont.MadaniV1) return word.codeV1;
  return word.codeV2;
};

const QuranWord = ({ word, font, highlight, allowWordByWord = true }: QuranWordProps) => {
  const [isTooltipOpened, setIsTooltipOpened] = useState(false);
  const { showWordByWordTranslation, showWordByWordTransliteration, showTooltipFor } =
    useSelector(selectReadingPreferences);
  const isWordByWordLayout = showWordByWordTranslation || showWordByWordTransliteration;
  let wordText = null;

  if (isQCFFont(font)) {
    wordText = <GlyphWord font={font} text={getGlyph(word, font)} pageNumber={word.pageNumber} />;
  } else if (word.charTypeName !== CharType.Pause) {
    wordText = <TextWord font={font} text={word.text} charType={word.charTypeName} />;
  }

  /*
    Only show the tooltip when the following conditions are met:

    1. When the current character is of type Word.
    2. When it's allowed to have word by word (won't be allowed for search results as of now).
    3. When the tooltip settings are set to either translation or transliteration or both.
  */
  const showTooltip =
    word.charTypeName === CharType.Word && allowWordByWord && !!showTooltipFor.length;
  // will be highlighted either if it's explicitly set to be so or when the tooltip is open.
  const shouldBeHighLighted = highlight || isTooltipOpened;
  return (
    <div
      className={classNames(styles.container, {
        [styles.highlighted]: shouldBeHighLighted,
        [styles.wbwContainer]: isWordByWordLayout,
      })}
    >
      <Wrapper
        shouldWrap={showTooltip}
        wrapper={(children) => (
          <Tooltip
            text={getTooltipText(showTooltipFor, word)}
            contentSide={ContentSide.TOP}
            onOpenChange={setIsTooltipOpened}
            delay={0}
          >
            {children}
          </Tooltip>
        )}
      >
        {wordText}
      </Wrapper>
      {allowWordByWord && (
        <>
          {showWordByWordTransliteration && (
            <p className={styles.wbwText}>{word.transliteration?.text}</p>
          )}
          {showWordByWordTranslation && <p className={styles.wbwText}>{word.translation?.text}</p>}
        </>
      )}
    </div>
  );
};

/**
 * Generate the Tooltip content based on the settings.
 *
 * @param {WordByWordType[]} showTooltipFor
 * @param {Word} word
 * @returns {ReactNode}
 */
const getTooltipText = (showTooltipFor: WordByWordType[], word: Word): ReactNode => (
  <>
    {showTooltipFor.map((tooltipTextType) => (
      <p key={tooltipTextType} className={styles.tooltipText}>
        {word[tooltipTextType].text}
      </p>
    ))}
  </>
);

export default QuranWord;
