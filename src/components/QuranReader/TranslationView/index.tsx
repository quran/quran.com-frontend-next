/* eslint-disable react/no-danger */
import React from 'react';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Link from 'next/link';
import VerseActions from 'src/components/Verse/VerseActions';
import classNames from 'classnames';
import ChapterHeader from 'src/components/chapters/ChapterHeader';
import Verse from '../../../../types/Verse';
import VerseText from '../../Verse/VerseText';
import Translation from '../../../../types/Translation';
import styles from './TranslationView.module.scss';
import { QuranReaderDataType } from '../types';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
  quranReaderDataType: QuranReaderDataType;
};

const HIDE_VERSE_LINK = {
  [QuranReaderDataType.Verse]: true,
  [QuranReaderDataType.Tafsir]: true,
};

const TranslationView = ({
  verses,
  quranReaderStyles,
  quranReaderDataType,
}: TranslationViewProps) => (
  <div className={styles.container}>
    {verses.map((verse) => (
      <div key={verse.id}>
        {verse.verseNumber === 1 && <ChapterHeader chapterId={String(verse.chapterId)} />}
        <div className={classNames({ [styles.highlightedContainer]: false })}>
          {!HIDE_VERSE_LINK[quranReaderDataType] && (
            <Link
              as={`/${verse.chapterId}/${verse.verseNumber}`}
              href="/[chapterId]/[verseId]"
              passHref
            >
              <p className={styles.verseLink}>{verse.verseKey}</p>
            </Link>
          )}
          <VerseActions verse={verse} />
          <VerseText words={verse.words} />
          {verse.translations?.map((translation: Translation) => (
            <div key={translation.id}>
              <div
                className={styles.text}
                dangerouslySetInnerHTML={{ __html: translation.text }}
                style={{ fontSize: `${quranReaderStyles.translationFontSize}rem` }}
              />
              <p className={styles.translationName}>— {translation.resourceName}</p>
            </div>
          ))}
          <hr />
        </div>
      </div>
    ))}
  </div>
);

export default TranslationView;
