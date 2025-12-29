import React, { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/components/chapters/ChapterHeader/ChapterHeader.module.scss';
import SurahInfoContent from '@/components/chapters/Info/SurahInfoContent';
import FakeContentModal from '@/components/dls/ContentModal/FakeContentModal';
import { ContentModalSize } from '@/dls/ContentModal/ContentModal';
import Chapter from '@/types/Chapter';
import { getSurahNavigationUrl } from '@/utils/navigation';
import { ChapterInfoResponse } from 'types/ApiResponses';

interface SurahInfoPageProps {
  chapterInfo?: ChapterInfoResponse['chapterInfo'];
  chapter: Chapter;
}

const SurahInfoPage: React.FC<SurahInfoPageProps> = ({ chapterInfo, chapter }) => {
  const { t } = useTranslation('quran-reader');
  const router = useRouter();

  const surahUrl = getSurahNavigationUrl(chapter.id);

  const handleClose = useCallback(() => {
    router.push(surahUrl);
  }, [surahUrl, router]);

  return (
    <FakeContentModal
      onClose={handleClose}
      closeAriaLabel={t('surah-info:go-to-surah')}
      closeToHref={surahUrl}
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
