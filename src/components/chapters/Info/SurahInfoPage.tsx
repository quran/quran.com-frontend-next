import React, { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/chapters/ChapterHeader/ChapterHeader.module.scss';
import SurahInfoContent from '@/components/chapters/Info/SurahInfoContent';
import FakeContentModal from '@/components/dls/ContentModal/FakeContentModal';
import { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import Chapter from '@/types/Chapter';
import ChapterInfo from '@/types/ChapterInfo';
import { fakeNavigate, getSurahNavigationUrl } from '@/utils/navigation';

interface SurahInfoPageProps {
  chapterInfo: ChapterInfo;
  chapter: Chapter;
}

const SurahInfoPage: React.FC<SurahInfoPageProps> = ({ chapterInfo, chapter }) => {
  const { t } = useTranslation('quran-reader');
  const router = useRouter();

  const handleClose = useCallback(() => {
    fakeNavigate(getSurahNavigationUrl(chapter.id), router.locale);
  }, [chapter.id, router.locale]);

  return (
    <FakeContentModal
      onClose={handleClose}
      hasCloseButton
      header={<div className={styles.surahInfoTitle}>{t('surah-info')}</div>}
      headerClassName={styles.surahInfoHeader}
      contentClassName={styles.surahInfoContent}
      size={ContentModalSize.MEDIUM}
    >
      <SurahInfoContent
        chapterId={String(chapter.id)}
        chapterInfo={chapterInfo}
        chapter={chapter}
      />
    </FakeContentModal>
  );
};

export default SurahInfoPage;
