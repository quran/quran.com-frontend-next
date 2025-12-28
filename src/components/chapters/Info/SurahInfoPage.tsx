import React, { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/chapters/ChapterHeader/ChapterHeader.module.scss';
import SurahInfoContent from '@/components/chapters/Info/SurahInfoContent';
import FakeContentModal from '@/components/dls/ContentModal/FakeContentModal';
import { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import { getSurahNavigationUrl } from '@/utils/navigation';
import { ChapterInfoResponse } from 'types/ApiResponses';
import ChaptersData from 'types/ChaptersData';

interface SurahInfoPageProps {
  chapterInfo?: ChapterInfoResponse['chapterInfo'];
  chapter: ChaptersData[string];
}

const SurahInfoPage: React.FC<SurahInfoPageProps> = ({ chapterInfo, chapter }) => {
  const { t } = useTranslation('quran-reader');
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.push(getSurahNavigationUrl(chapter.id));
  }, [chapter.id, router]);

  return (
    <FakeContentModal
      onClose={handleClose}
      hasCloseButton
      header={<div className={styles.surahInfoHeader}>{t('surah-info')}</div>}
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
