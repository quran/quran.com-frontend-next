import React from 'react';
import pad from 'lodash/pad';
import WordWrap from './WordWrap';
import WordGlyph from './WordGlyph';
import WordType from '../../../../types/WordType';
import { WORD_TYPES } from '../../../constants/words';
import WordTransparent from './WordTransparent';

type QuranWordProps = {
  word: WordType;
  setCurrentWord?: $TsFixMe;
  pause?: $TsFixMe;
  setCurrentVerseKey?: $TsFixMe;
  playCurrentWord?: $TsFixMe;
  tooltip: 'translation' | 'transliteration';
  audioPosition?: number;
  isCurrentVersePlaying?: boolean;
  isSearched?: boolean;
  useTextFont?: boolean;
};

const QuranWord = ({
  word,
  isCurrentVersePlaying = false,
  audioPosition,
  useTextFont,
}: QuranWordProps) => {
  let text = '';

  // const className = `${useTextFont ? 'text-' : ''}${word.className} ${word.charType} ${
  //   word.highlight ? word.highlight : ''
  // }`;

  if (useTextFont) {
    if (word.charType === WORD_TYPES.CHAR_TYPE_END) {
      text = pad(word.verseKey.split(':')[1], 3, '0');
    } else if (word.textMadani) {
      text = word.textMadani;
    }
  } else {
    text = word.code;
  }

  return (
    <WordWrap
      role="button"
      tabIndex={audioPosition}
      highlight={isCurrentVersePlaying}
      // onDoubleClick={this.handleSegmentPlay}
      // onClick={this.handleWordPlay}
      // onKeyPress={this.handleWordPlay}
    >
      <WordGlyph wordClassName={word.className} dangerouslySetInnerHTML={{ __html: text }} />

      <WordTransparent dangerouslySetInnerHTML={{ __html: `${word.textMadani} ` || ' ' }} />
    </WordWrap>
  );
};

export default QuranWord;
