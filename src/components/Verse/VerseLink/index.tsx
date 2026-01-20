import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './VerseLink.module.scss';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { selectStudyModeIsOpen } from '@/redux/slices/QuranReader/studyMode';
import { logButtonClick } from '@/utils/eventLogger';
import { isRTLLocale, toLocalizedVerseKey, toLocalizedVerseKeyRTL } from '@/utils/locale';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';

interface Props {
  verseKey: string;
  isTranslationView: boolean;
}

const VerseLink: React.FC<Props> = ({ verseKey, isTranslationView }) => {
  const { lang } = useTranslation('');
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);

  return (
    <Button
      className={classNames(styles.verseLink)}
      contentClassName={styles.verseLinkContent}
      size={ButtonSize.Small}
      shape={ButtonShape.Square}
      href={isStudyModeOpen ? undefined : getChapterWithStartingVerseUrl(verseKey)}
      shouldShallowRoute
      variant={ButtonVariant.Ghost}
      shouldPrefetch={false}
      isDisabled={isStudyModeOpen}
      onClick={() => {
        logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_verse_link`);
      }}
    >
      {isRTLLocale(lang)
        ? toLocalizedVerseKeyRTL(verseKey, lang)
        : toLocalizedVerseKey(verseKey, lang)}
    </Button>
  );
};

export default VerseLink;
