/* eslint-disable react/no-danger */
import React from 'react';
import { QuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import Link from 'next/link';
import { useRouter } from 'next/router';
import VerseActions from 'src/components/Verse/VerseActions';
import classNames from 'classnames';
import Verse from '../../../../types/Verse';
import VerseText from '../../Verse/VerseText';
import Translation from '../../../../types/Translation';
import styles from './TranslationView.module.scss';

type TranslationViewProps = {
  verses: Verse[];
  quranReaderStyles: QuranReaderStyles;
};

const TranslationView = ({ verses, quranReaderStyles }: TranslationViewProps) => {
  const router = useRouter();
  const {
    query: { chapterId },
  } = router;
  return (
    <div className={styles.container}>
      {verses.map((verse) => (
        <div key={verse.id} className={classNames({ [styles.highlightedContainer]: false })}>
          <Link as={`/${chapterId}/${verse.verseNumber}`} href="/[chapterId]/[verseId]" passHref>
            <p className={styles.verseLink}>{verse.verseKey}</p>
          </Link>
          <VerseActions verse={verse} />
          <VerseText words={verse.words} />
          {verse.translations?.map((translation: Translation) => (
            <div
              className={styles.text}
              key={translation.id}
              dangerouslySetInnerHTML={{ __html: translation.text }}
              style={{ fontSize: `${quranReaderStyles.translationFontSize}rem` }}
            />
          ))}
          <hr />
        </div>
      ))}
    </div>
  );
};

export default TranslationView;
