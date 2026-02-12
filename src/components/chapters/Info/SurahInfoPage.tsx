import React, { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import surahInfoStyles from './SurahInfoModal.module.scss';

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
      header={<div>{t('surah-info')}</div>}
      headerClassName={surahInfoStyles.surahInfoHeader}
      contentClassName={surahInfoStyles.surahInfoContent}
      innerContentClassName={surahInfoStyles.surahInfoInnerContent}
      size={ContentModalSize.MEDIUM}
      overlayClassName={surahInfoStyles.surahInfoOverlay}
      closeIconClassName={surahInfoStyles.closeIconContainer}
      dataTestId="surah-info-content"
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
