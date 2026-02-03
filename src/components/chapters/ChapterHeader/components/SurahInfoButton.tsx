import React, { useCallback, useContext, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '../ChapterHeader.module.scss';

import SurahInfoContent from '@/components/chapters/Info/SurahInfoContent';
import surahInfoStyles from '@/components/chapters/Info/SurahInfoModal.module.scss';
import ContentModal, { ContentModalSize } from '@/components/dls/ContentModal/ContentModal';
import DataContext from '@/contexts/DataContext';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getSurahInfoNavigationUrl, getSurahNavigationUrl } from '@/utils/navigation';

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
  const chaptersData = useContext(DataContext);
  const chapter = getChapterData(chaptersData, String(chapterId));
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);

    /*
     * When closing the surah info modal, we fake different URLs in the browser:
     * - If we're on a regular surah page (e.g., /1 or /1:1), fake router.asPath to keep the same URL
     * - If we're on the dedicated surah info page (/surah/[chapterId]/info), fake the main surah page URL
     *
     * This ensures the browser URL stays accurate - users on /1:1 keep /1:1 in the address bar,
     * rather than faking it to just /1 which would be incorrect.
     */
    if (!router.pathname.includes('/surah/[chapterId]/info')) {
      fakeNavigate(router.asPath, router.locale);
    } else {
      fakeNavigate(getSurahNavigationUrl(chapterId), router.locale);
    }
  }, [router, chapterId]);

  const handleClick = useCallback(() => {
    if (chapterId) {
      logButtonClick('surah_info_button_click');
      setIsOpen(true);
      fakeNavigate(getSurahInfoNavigationUrl(chapterId), router.locale);
    }
  }, [chapterId, router.locale]);

  return (
    <>
      <button
        className={classNames(styles.infoIconButton, className)}
        onClick={handleClick}
        aria-label={t('surah-info')}
        type="button"
        data-testid="surah-info-button"
      >
        {t('info')}
      </button>
      {chapterId && (
        <ContentModal
          isOpen={isOpen}
          onClose={handleClose}
          onEscapeKeyDown={handleClose}
          hasCloseButton
          header={<div className={styles.surahInfoTitle}>{t('surah-info')}</div>}
          headerClassName={styles.surahInfoHeader}
          contentClassName={classNames(
            styles.surahInfoContent,
            surahInfoStyles.bottomSheetOnDesktopContent,
          )}
          overlayClassName={surahInfoStyles.bottomSheetOnDesktopOverlay}
          innerContentClassName={surahInfoStyles.bottomSheetOnDesktopInnerContent}
          size={ContentModalSize.MEDIUM}
        >
          <SurahInfoContent chapterId={chapterId} chapter={chapter} />
        </ContentModal>
      )}
    </>
  );
};

export default SurahInfoButton;
