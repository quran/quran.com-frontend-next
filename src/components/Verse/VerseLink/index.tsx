import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './VerseLink.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { logButtonClick } from 'src/utils/eventLogger';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { getChapterWithStartingVerseUrl } from 'src/utils/navigation';

interface Props {
  verseKey: string;
}

const VerseLink: React.FC<Props> = ({ verseKey }) => {
  const { lang } = useTranslation('');
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
      {toLocalizedVerseKey(verseKey, lang)}
    </Button>
  );
};

export default VerseLink;
