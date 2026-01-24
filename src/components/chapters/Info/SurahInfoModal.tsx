import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import styles from './SurahInfoModal.module.scss';

import { getChapterInfo } from '@/api';
import SurahInfoContent from '@/components/chapters/Info/SurahInfoContent';
import Spinner from '@/components/dls/Spinner/Spinner';
import DataContext from '@/contexts/DataContext';
import { makeChapterInfoUrl } from '@/utils/apiPaths';
import { getChapterData } from '@/utils/chapter';

interface SurahInfoModalProps {
  chapterId: string;
}

const SurahInfoModal: React.FC<SurahInfoModalProps> = ({ chapterId }) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const chapter = getChapterData(chaptersData, chapterId);

  const { data: chapterInfoResponse, error } = useSWRImmutable(
    makeChapterInfoUrl(chapterId, lang),
    () => getChapterInfo(chapterId, lang),
  );

  if (!chapter) return null;

  const isLoading = !chapterInfoResponse && !error;
  const chapterInfo = chapterInfoResponse?.chapterInfo;

  return (
    <>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      )}

      {error && !chapterInfo && (
        <div className={styles.errorContainer}>
          <p>{t('common:error.general')}</p>
        </div>
      )}

      {chapterInfo && (
        <SurahInfoContent chapterId={chapterId} chapter={chapter} chapterInfo={chapterInfo} />
      )}
    </>
  );
};

export default SurahInfoModal;
