import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import InfoIcon from '@/icons/info.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getSurahInfoNavigationUrl } from '@/utils/navigation';

interface SurahInfoButtonProps {
  chapterId: string;
}

/**
 * SurahInfoButton component displays a button to navigate to surah info
 * @param {SurahInfoButtonProps} props - Component props
 * @returns {JSX.Element} The SurahInfoButton component
 */
const SurahInfoButton: React.FC<SurahInfoButtonProps> = ({ chapterId }) => {
  const { t } = useTranslation('common');

  return (
    <Button
      size={ButtonSize.Small}
      variant={ButtonVariant.Ghost}
      prefix={<InfoIcon />}
      href={getSurahInfoNavigationUrl(chapterId)}
      shouldPrefetch={false}
      hasSidePadding={false}
      onClick={() => {
        logButtonClick('chapter_header_info');
      }}
      id="surah-info-button"
      aria-label={t('quran-reader:surah-info')}
    >
      {t('quran-reader:surah-info')}
    </Button>
  );
};

export default SurahInfoButton;
