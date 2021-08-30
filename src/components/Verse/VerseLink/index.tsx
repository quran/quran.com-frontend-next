import React from 'react';
import Button, { ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import { getVerseNavigationUrl } from 'src/utils/navigation';
import styles from './VerseLink.module.scss';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const url = getVerseNavigationUrl(verseKey);
  return (
    <div className={styles.verseLink}>
      <Button href={url} variant={ButtonVariant.Shadow} type={ButtonType.Secondary}>
        {verseKey}
      </Button>
    </div>
  );
};

export default VerseLink;
