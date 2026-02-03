import React, { useState, useMemo, useCallback } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import styles from './SurahInfoModal.module.scss';

import { getChapterInfo } from '@/api';
import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Spinner from '@/components/dls/Spinner/Spinner';
import { ChapterInfoResponse } from '@/types/ApiResponses';
import Chapter from '@/types/Chapter';
import Language from '@/types/Language';
import { makeChapterInfoUrl } from '@/utils/apiPaths';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
import { fakeNavigate, getSurahInfoNavigationUrl } from '@/utils/navigation';

interface SurahInfoContentProps {
  chapterId: string;
  chapter: Chapter;
  initialResourceId?: string | null;
}

const SurahInfoContent: React.FC<SurahInfoContentProps> = ({
  chapterId,
  chapter,
  initialResourceId,
}) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const shouldHideTransliteration = shouldUseMinimalLayout(lang);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(initialResourceId);

  const apiParams = useMemo(
    () => ({
      includeResources: true,
      ...(selectedResourceId && { resourceId: selectedResourceId }),
    }),
    [selectedResourceId],
  );

  const {
    data: chapterInfoData,
    error,
    isValidating,
  } = useSWRImmutable<ChapterInfoResponse>(makeChapterInfoUrl(chapterId, lang, apiParams), () =>
    getChapterInfo(chapterId, lang, apiParams),
  );

  const chapterInfo = chapterInfoData?.chapterInfo;
  const resources = chapterInfoData?.resources;

  const handleResourceChange = useCallback(
    (resourceId: string) => {
      setSelectedResourceId(resourceId);
      const newUrl = getSurahInfoNavigationUrl(chapter.id.toString(), resourceId);
      fakeNavigate(newUrl, router.locale || Language.EN);
    },
    [chapter.id, router.locale],
  );

  if (!chapterInfo && isValidating && !error) {
    return (
      <div className={styles.surahInfoModalContent}>
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (error && !chapterInfo) {
    return (
      <div className={styles.surahInfoModalContent}>
        <div className={styles.errorContainer}>
          <p>{t('common:error.general')}</p>
        </div>
      </div>
    );
  }

  if (!chapterInfo) return null;

  return (
    <>
      <div className={styles.bottomSheetOnDesktopHeaderSeparator} />
      <div className={styles.surahInfoModalContent} data-testid="surah-info-content">
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

        {resources.length > 0 && selectedResourceId && (
          <div className={styles.resourceTabs}>
            {resources.map((resource) => (
              <button
                key={resource.id}
                type="button"
                className={classNames(styles.resourceTab, {
                  [styles.resourceTabActive]: String(resource.id) === selectedResourceId,
                })}
                onClick={() => handleResourceChange(String(resource.id))}
              >
                {resource.translatedName?.name || resource.name}
              </button>
            ))}
          </div>
        )}

        {error ? (
          <div className={styles.errorContainer}>
            <p>{t('common:error.general')}</p>
          </div>
        ) : (
          <div
            className={styles.descriptionContainer}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: chapterInfo.text }}
          />
        )}
      </div>
    </>
  );
};

export default SurahInfoContent;
