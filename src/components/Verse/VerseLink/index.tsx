import React from 'react';
import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import { getVerseAndChapterNumbersFromKey } from 'src/utils/verse';
import styles from './VerseLink.module.scss';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  return (
    <div className={styles.verseLink}>
      <Button
        href={`/${chapterId}/${verseNumber}`}
        variant={ButtonVariant.Shadow}
        type={ButtonType.Secondary}
      >
        {verseKey}
      </Button>
    </div>
  );
};

export default VerseLink;
