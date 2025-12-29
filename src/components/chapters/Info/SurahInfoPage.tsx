import React, { useCallback, useEffect } from 'react';

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

  useEffect(() => {
    router.prefetch(getSurahNavigationUrl(chapter.id), undefined, {
      locale: router.locale,
      priority: true,
    });
  }, [chapter.id, router.locale, router]);

  const handleClose = useCallback(() => {
    router.push(getSurahNavigationUrl(chapter.id), undefined, {
      shallow: false,
      scroll: false,
    });
  }, [chapter.id, router]);

  return (
    <FakeContentModal
      onClose={handleClose}
      closeAriaLabel={t('surah-info:go-to-surah')}
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
