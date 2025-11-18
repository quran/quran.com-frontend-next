import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from '../ChapterHeader.module.scss';

import Bismillah from '@/dls/Bismillah/Bismillah';

interface BismillahSectionProps {
  chapterId: string;
  showTranslatedName: boolean;
  isTranslationView: boolean;
}

const CHAPTERS_WITHOUT_BISMILLAH = ['1', '9'];

/**
 * BismillahSection component displays Bismillah if the chapter should include it
 * @param {BismillahSectionProps} props - Component props
 * @returns {JSX.Element | null} The BismillahSection component
 */
const BismillahSection: React.FC<BismillahSectionProps> = ({
  chapterId,
  showTranslatedName,
  isTranslationView,
}) => {
  const { t } = useTranslation('quran-reader');

  if (CHAPTERS_WITHOUT_BISMILLAH.includes(chapterId)) {
    return null;
  }

  return (
    <div
      className={classNames(styles.bismillahContainer, {
        [styles.withReadingView]: !isTranslationView,
        [styles.withTranslationView]: isTranslationView,
      })}
      data-testid="bismillah-section"
    >
      <Bismillah />
      {!showTranslatedName && <span className={styles.bismillahTranslation}>{t('bismillah')}</span>}
    </div>
  );
};

export default BismillahSection;
