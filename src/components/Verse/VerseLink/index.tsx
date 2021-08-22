import Link from 'next/link';
import React from 'react';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import styles from './VerseLink.module.scss';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return (
    <Link as={`/${chapterId}/${verseNumber}`} href="/[chapterId]/[verseId]" passHref>
      <p className={styles.verseLink}>{verseKey}</p>
    </Link>
  );
};

export default VerseLink;
