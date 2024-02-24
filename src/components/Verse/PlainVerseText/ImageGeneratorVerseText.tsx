import React from 'react';

import classNames from 'classnames';

import styles from '../VerseText.module.scss';

import PlainVerseTextWord from './PlainVerseTextWord';

import TextWord from '@/dls/QuranWord/TextWord';
import { getFontClassName } from '@/utils/fontFaceHelper';
import { MushafLines, QuranFont } from 'types/QuranReader';
import Word from 'types/Word';

type Props = {
  words: Word[];
  shouldShowWordByWordTranslation?: boolean;
  shouldShowWordByWordTransliteration?: boolean;
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
const ImageGeneratorVerseText: React.FC<Props> = ({
  words,
  shouldShowWordByWordTranslation = false,
  shouldShowWordByWordTransliteration = false,
  quranFont,
}: Props): JSX.Element => {
  return (
    <div
      className={classNames(styles.verseTextContainer, styles.tafsirOrTranslationMode, {
        [styles[getFontClassName(quranFont, 1, MushafLines.FifteenLines)]]:
          quranFont !== QuranFont.Tajweed,
      })}
    >
      <div className={classNames(styles.verseText, styles.verseTextWrap)} translate="no">
        {words?.map((word) => {
          return (
            <PlainVerseTextWord
              key={word.location}
              word={word}
              shouldShowWordByWordTranslation={shouldShowWordByWordTranslation}
              shouldShowWordByWordTransliteration={shouldShowWordByWordTransliteration}
            >
              <TextWord font={quranFont} text={word.qpcUthmaniHafs} charType={word.charTypeName} />
            </PlainVerseTextWord>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGeneratorVerseText;
