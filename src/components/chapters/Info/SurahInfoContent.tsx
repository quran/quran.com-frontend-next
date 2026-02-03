import React, { useState, useMemo, useCallback } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useSWRImmutable from 'swr/immutable';

import styles from './SurahInfoModal.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { getChapterInfo } from '@/api';
import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Chapter from '@/types/Chapter';
import ChapterInfo from '@/types/ChapterInfo';
import type { ChapterInfoResource } from '@/types/ChapterInfo';
import { makeChapterInfoUrl } from '@/utils/apiPaths';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';
import { fakeNavigate, getSurahInfoNavigationUrl } from '@/utils/navigation';

interface SurahInfoContentProps {
  chapterId: string;
  chapter: Chapter;
  chapterInfo?: ChapterInfo;
  resources?: ChapterInfoResource[];
  initialResourceId?: string | null;
}

const SurahInfoContent: React.FC<SurahInfoContentProps> = ({
  chapterId,
  chapter,
  chapterInfo: initialChapterInfo,
  resources: initialResources = [],
  initialResourceId,
}) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const shouldHideTransliteration = shouldUseMinimalLayout(lang);

  // If chapterInfo is not provided, fetch it (client-side only case)
  const shouldFetchInitial = !initialChapterInfo;
  const { data: initialDataResponse, error: initialError } = useSWRImmutable(
    shouldFetchInitial ? makeChapterInfoUrl(chapterId, lang, { includeResources: true }) : null,
    () => getChapterInfo(chapterId, lang, { includeResources: true }),
  );

  // Use fetched data or initial props
  const chapterInfo = initialDataResponse?.chapterInfo || initialChapterInfo;
  const resources = initialDataResponse?.resources || initialResources;

  // Get the initial resource ID from props or use the ID from the chapterInfo we received
  const activeResourceId = useMemo(() => {
    if (initialResourceId) return initialResourceId;
    if (chapterInfo) return String(chapterInfo.id);
    return null;
  }, [initialResourceId, chapterInfo]);

  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(activeResourceId);

  // Fetch data when resource changes on client side
  const shouldFetchResource = selectedResourceId && selectedResourceId !== activeResourceId;
  const { data: chapterInfoResponse, error } = useSWRImmutable(
    shouldFetchResource
      ? makeChapterInfoUrl(chapterId, lang, {
          resourceId: selectedResourceId,
          includeResources: true,
        })
      : null,
    () =>
      getChapterInfo(chapterId, lang, { resourceId: selectedResourceId, includeResources: true }),
  );

  // Use fetched data or initial data
  const currentChapterInfo = chapterInfoResponse?.chapterInfo || chapterInfo;

  const handleResourceChange = useCallback(
    (resourceId: string) => {
      setSelectedResourceId(resourceId);
      // Fake the URL to show the resource ID without triggering a page reload
      const newUrl = `${getSurahInfoNavigationUrl(chapter.slug)}/${resourceId}`;
      fakeNavigate(newUrl, router.locale || 'en');
    },
    [chapter.slug, router.locale],
  );

  // Show loading state when fetching initial data
  if (shouldFetchInitial && !initialDataResponse && !initialError) {
    return (
      <div className={styles.surahInfoModalContent}>
        <div className={styles.loadingContainer}>
          <Spinner />
        </div>
      </div>
    );
  }

  // Show error state if initial fetch failed
  if (initialError && !chapterInfo) {
    return (
      <div className={styles.surahInfoModalContent}>
        <div className={styles.errorContainer}>
          <p>{t('common:error.general')}</p>
        </div>
      </div>
    );
  }

  // Don't render if we don't have chapter info yet
  if (!chapterInfo) {
    return null;
  }

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
            dangerouslySetInnerHTML={{ __html: currentChapterInfo.text }}
          />
        )}
      </div>
    </>
  );
};

export default SurahInfoContent;
