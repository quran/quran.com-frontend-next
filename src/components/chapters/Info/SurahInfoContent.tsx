import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import styles from './SurahInfoModal.module.scss';
import useSurahInfo from './useSurahInfo';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Spinner from '@/components/dls/Spinner/Spinner';
import Error from '@/components/Error';
import FontSizeControl from '@/components/QuranReader/ReadingView/StudyModeModal/FontSizeControl';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Chapter from '@/types/Chapter';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';

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
  const shouldHideTransliteration = shouldUseMinimalLayout(lang);
  const quranReaderStyles = useSelector(selectQuranReaderStyles);

  const {
    chapterInfo,
    storedResources,
    selectedResourceId,
    error,
    isLoadingOrValidating,
    isError,
    isEmpty,
    mutate,
    handleResourceChange,
  } = useSurahInfo({ chapterId, initialResourceId });

  return (
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
            <p data-testid="surah-revelation-place">{t(`surah-info:${chapter.revelationPlace}`)}</p>
          </div>
        </div>
      </div>

      <div className={styles.options}>
        <FontSizeControl fontType="surahInfo" />
        {storedResources && storedResources.length > 1 && (
          <div className={styles.resourceTabs} role="tablist">
            {storedResources.map((resource) => {
              const isSelected =
                String(resource.id) === selectedResourceId ||
                chapterInfo?.resourceId?.toString() === resource.id.toString();

              return (
                <button
                  key={resource.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleResourceChange(String(resource.id))}
                  className={classNames(styles.resourceTab, {
                    [styles.resourceTabActive]: isSelected,
                  })}
                >
                  {resource.translatedName?.name ?? resource.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isLoadingOrValidating && (
        <div className={styles.statusContainer} data-status="loading">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className={styles.statusContainer} data-status="error">
          <Error onRetryClicked={() => mutate()} error={error as Error} />
        </div>
      )}

      {isEmpty && (
        <div className={styles.statusContainer} data-status="empty">
          <p>{t('surah-info:not-found')}</p>
        </div>
      )}

      {chapterInfo && (
        <div
          className={classNames(
            styles.descriptionContainer,
            styles[`surahInfo-font-size-${quranReaderStyles.surahInfoFontScale}`],
          )}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: chapterInfo.source
              ? `<p>${chapterInfo.source}</p> ${chapterInfo.text}`
              : chapterInfo.text,
          }}
        />
      )}
    </div>
  );
};

export default SurahInfoContent;
