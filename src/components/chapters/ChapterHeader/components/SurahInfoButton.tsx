import React, { useCallback } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '../ChapterHeader.module.scss';

import SurahInfoModal from '@/components/chapters/Info/SurahInfoModal';
import ContentModal, { ContentModalSize } from '@/components/dls/ContentModal/ContentModal';
import InfoIcon from '@/icons/info.svg';
import QueryParam from '@/types/QueryParam';
import { logButtonClick } from '@/utils/eventLogger';

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
  const isOpen = router.query[QueryParam.SURAH_INFO] !== undefined;

  const updateModalQueryParam = useCallback(
    (shouldOpen: boolean) => {
      if (!chapterId) return;
      const nextQuery = { ...router.query };
      if (shouldOpen) {
        nextQuery[QueryParam.SURAH_INFO] = 'true';
      } else {
        delete nextQuery[QueryParam.SURAH_INFO];
      }

      router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
        shallow: true,
        scroll: false,
      });
    },
    [chapterId, router],
  );

  const handleClose = useCallback(() => {
    updateModalQueryParam(false);
  }, [updateModalQueryParam]);

  const handleClick = () => {
    if (chapterId) {
      logButtonClick('surah_info_button_click');
      updateModalQueryParam(true);
    }
  };

  return (
    <>
      <button
        className={classNames(styles.infoIconButton, className)}
        onClick={handleClick}
        aria-label={t('surah-info')}
        type="button"
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
