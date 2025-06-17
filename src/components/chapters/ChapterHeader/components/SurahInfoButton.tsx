import React from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '../ChapterHeader.module.scss';

import InfoIcon from '@/icons/info.svg';
import { getSurahInfoNavigationUrl } from '@/utils/navigation';

interface SurahInfoButtonProps {
  chapterId?: string;
  className?: string;
}

/**
 * SurahInfoButton component displays a button to navigate to surah info
 * @param {SurahInfoButtonProps} props - Component props
 * @returns {JSX.Element} The SurahInfoButton component
 */
const SurahInfoButton: React.FC<SurahInfoButtonProps> = ({ chapterId, className }) => {
  const { t } = useTranslation('quran-reader');
  const router = useRouter();
  return (
    <button
      className={classNames(styles.infoIconButton, className)}
      onClick={() => {
        router.push(getSurahInfoNavigationUrl(chapterId));
      }}
      aria-label={t('surah-info')}
      type="button"
    >
      <InfoIcon width="18" height="18" />
    </button>
  );
};

export default SurahInfoButton;
