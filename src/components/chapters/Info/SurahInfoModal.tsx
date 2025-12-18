import React, { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import styles from './SurahInfoModal.module.scss';

import { getChapterInfo } from '@/api';
import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Spinner from '@/components/dls/Spinner/Spinner';
import DataContext from '@/contexts/DataContext';
import { makeChapterInfoUrl } from '@/utils/apiPaths';
import { getChapterData } from '@/utils/chapter';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';

interface SurahInfoModalProps {
  chapterId: string;
}

const SurahInfoModal: React.FC<SurahInfoModalProps> = ({ chapterId }) => {
  const { t, lang } = useTranslation();
  const chaptersData = useContext(DataContext);
  const chapter = getChapterData(chaptersData, chapterId);

  const shouldHideTransliteration = shouldUseMinimalLayout(lang);

  const { data: chapterInfoResponse, error } = useSWRImmutable(
    makeChapterInfoUrl(chapterId, lang),
    () => getChapterInfo(chapterId, lang),
  );

  if (!chapter) return null;

  const isLoading = !chapterInfoResponse && !error;
  const chapterInfo = chapterInfoResponse?.chapterInfo;

  return (
    <div>
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
        <>
          <div className={styles.headerContainer}>
            <div className={styles.calligraphyContainer}>
              <ChapterIconContainer
                chapterId={chapterId}
                size={ChapterIconsSize.XMega}
                hasSurahPrefix={false}
              />
            </div>

            {!shouldHideTransliteration && (
              <h2 className={styles.surahName} data-testid="surah-name">
                {t('common:surah')} {chapter.transliteratedName}
              </h2>
            )}

            <div className={styles.detailsContainer}>
              <div className={styles.detailItem}>
                <p className={styles.detailHeader}>{t('common:ayahs')}:</p>
                <p data-testid="surah-number-of-ayahs">
                  {toLocalizedNumber(chapter.versesCount, lang)}
                </p>
              </div>
              <div className={styles.detailItem}>
                <p className={styles.detailHeader}>{t('surah-info:revelation-place')}:</p>
                <p data-testid="surah-revelation-place">
                  {t(`surah-info:${chapter.revelationPlace}`)}
                </p>
              </div>
            </div>
          </div>

          <div
            className={styles.descriptionContainer}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: chapterInfo.text }}
          />
        </>
      )}
    </div>
  );
};

export default SurahInfoModal;
