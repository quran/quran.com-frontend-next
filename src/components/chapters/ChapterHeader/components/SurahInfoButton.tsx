import React, { useCallback, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '../ChapterHeader.module.scss';

import SurahInfoModal from '@/components/chapters/Info/SurahInfoModal';
import ContentModal, { ContentModalSize } from '@/components/dls/ContentModal/ContentModal';
import InfoIcon from '@/icons/info.svg';
import QueryParam from '@/types/QueryParam';
import { logButtonClick } from '@/utils/eventLogger';
import { getSurahInfoNavigationUrl } from '@/utils/navigation';

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

  /**
   * We keep a local `isModalOpen` state to ensure the UI updates instantly.
   * Relying only on query params would cause a visible delay while the URL updates.
   *
   * The query param is used **only to set the initial state** (e.g., when landing directly on the info page).
   * After mount, we do not react to query changes — avoiding unnecessary sync logic or race conditions.
   */
  const isInfoPage = router.pathname.includes('/surah/[chapterId]/info');
  const initialStateIsOpen = isInfoPage ? true : router.query[QueryParam.SURAH_INFO] !== undefined;
  const [isModalOpen, setIsModalOpen] = useState(initialStateIsOpen);

  const updateModalQueryParam = useCallback(
    (shouldOpen: boolean) => {
      if (!chapterId) return;
      const nextQuery = { ...router.query };
      if (shouldOpen) {
        nextQuery[QueryParam.SURAH_INFO] = 'true';
      } else {
        delete nextQuery[QueryParam.SURAH_INFO];
      }

      router.push(
        { pathname: router.pathname, query: nextQuery },
        shouldOpen ? getSurahInfoNavigationUrl(chapterId) : undefined,
        { shallow: true, scroll: false },
      );
    },
    [chapterId, router],
  );

  const handleClose = useCallback(() => {
    updateModalQueryParam(false);
    setIsModalOpen(false);
  }, [updateModalQueryParam]);

  const handleClick = () => {
    if (chapterId) {
      logButtonClick('surah_info_button_click');
      updateModalQueryParam(true);
      setIsModalOpen(true);
    }
  };

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
          isOpen={isModalOpen}
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
