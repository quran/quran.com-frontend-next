import React, { useCallback, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '../ChapterHeader.module.scss';

import SurahInfoModal from '@/components/chapters/Info/SurahInfoModal';
import ContentModal, { ContentModalSize } from '@/components/dls/ContentModal/ContentModal';
import InfoIcon from '@/icons/info.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getSurahInfoNavigationUrl } from '@/utils/navigation';

interface SurahInfoButtonProps {
  chapterId?: string;
  className?: string;
}

/**
 * SurahInfoButton component displays a button to open surah info modal
 * @param {SurahInfoButtonProps} props - Component props
 * @returns {JSX.Element} The SurahInfoButton component
 */
const SurahInfoButton: React.FC<SurahInfoButtonProps> = ({ chapterId, className }) => {
  const { t } = useTranslation('quran-reader');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    fakeNavigate(router.asPath, router.locale);
  }, [router.asPath, router.locale, setIsOpen]);

  const handleClick = useCallback(() => {
    if (chapterId) {
      logButtonClick('surah_info_button_click');
      setIsOpen(true);
      fakeNavigate(getSurahInfoNavigationUrl(chapterId), router.locale);
    }
  }, [chapterId, router.locale, setIsOpen]);

  return (
    <>
      <button
        className={classNames(styles.infoIconButton, className)}
        onClick={handleClick}
        aria-label={t('surah-info')}
        type="button"
        data-testid="surah-info-button"
      >
        <InfoIcon width="18" height="18" />
      </button>
      {chapterId && (
        <ContentModal
          isOpen={isOpen}
          onClose={handleClose}
          onEscapeKeyDown={handleClose}
          hasCloseButton
          header={<div className={styles.surahInfoHeader}>{t('surah-info')}</div>}
          size={ContentModalSize.MEDIUM}
        >
          <SurahInfoModal chapterId={chapterId} />
        </ContentModal>
      )}
    </>
  );
};

export default SurahInfoButton;
