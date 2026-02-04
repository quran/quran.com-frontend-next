import React, { useCallback } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import surahInfoStyles from './SurahInfoModal.module.scss';

import styles from '@/components/chapters/ChapterHeader/ChapterHeader.module.scss';
import SurahInfoContent from '@/components/chapters/Info/SurahInfoContent';
import ContentModal, { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import Chapter from '@/types/Chapter';
import { fakeNavigate, getSurahNavigationUrl } from '@/utils/navigation';

interface SurahInfoPageProps {
  chapter: Chapter;
  initialResourceId?: string | null;
  chapterId: string | number;
}

const SurahInfoPage: React.FC<SurahInfoPageProps> = ({ chapter, initialResourceId, chapterId }) => {
  const { t } = useTranslation('quran-reader');
  const router = useRouter();

  const handleClose = useCallback(() => {
    fakeNavigate(getSurahNavigationUrl(chapter.id), router.locale);
  }, [chapter.id, router.locale]);

  return (
    <ContentModal
      isFakeSEOFriendlyMode
      onClose={handleClose}
      hasCloseButton
      header={<div className={styles.surahInfoTitle}>{t('surah-info')}</div>}
      headerClassName={styles.surahInfoHeader}
      contentClassName={classNames(
        styles.surahInfoContent,
        surahInfoStyles.bottomSheetOnDesktopContent,
      )}
      size={ContentModalSize.MEDIUM}
      overlayClassName={surahInfoStyles.bottomSheetOnDesktopOverlay}
      innerContentClassName={surahInfoStyles.bottomSheetOnDesktopInnerContent}
      closeIconClassName={styles.closeIconContainer}
    >
      <SurahInfoContent
        chapterId={String(chapterId)}
        chapter={chapter}
        initialResourceId={initialResourceId}
      />
    </ContentModal>
  );
};

export default SurahInfoPage;
