import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './VerseLink.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

interface Props {
  verseKey: string;
  isTranslationView: boolean;
}

const VerseLink: React.FC<Props> = ({ verseKey, isTranslationView }) => {
  const { lang } = useTranslation('');
  return (
    <Button
      className={classNames(styles.verseLink)}
      size={ButtonSize.Small}
      shape={ButtonShape.Circle}
      href={getChapterWithStartingVerseUrl(verseKey)}
      shouldShallowRoute
      variant={ButtonVariant.Ghost}
      shouldPrefetch={false}
      onClick={() => {
        logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_verse_link`);
      }}
    >
      {toLocalizedVerseKey(verseKey, lang)}
    </Button>
  );
};

export default VerseLink;
