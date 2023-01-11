import React from 'react';

import { useRouter } from 'next/router';

import styles from './VerseLink.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const { locale } = useRouter();

  return (
    <Button
      className={styles.verseLink}
      size={ButtonSize.Small}
      shape={ButtonShape.Circle}
      href={getChapterWithStartingVerseUrl(verseKey)}
      shouldShallowRoute
      variant={ButtonVariant.Ghost}
      shouldPrefetch={false}
      onClick={() => {
        logButtonClick('translation_view_verse_link');
      }}
    >
      {toLocalizedVerseKey(verseKey, locale)}
    </Button>
  );
};

export default VerseLink;
