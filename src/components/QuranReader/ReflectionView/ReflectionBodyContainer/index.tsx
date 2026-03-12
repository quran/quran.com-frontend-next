/* eslint-disable max-lines */
import { useEffect, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import { getReflectionTabs, handleReflectionViewed } from './helpers';
import styles from './ReflectionBodyContainer.module.scss';
import useQuranReflectFeed from './useQuranReflectFeed';

import EbookBanner, { EbookBannerContext } from '@/components/Ebook/EbookBanner';
import { REFLECTIONS_OBSERVER_ID } from '@/components/QuranReader/observer';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import StudyModeChapterBanner from '@/components/StudyMode/StudyModeChapterBanner';
import Button, { ButtonShape, ButtonSize } from '@/dls/Button/Button';
import Tabs from '@/dls/Tabs/Tabs';
import useGlobalIntersectionObserverWithDelay from '@/hooks/useGlobalIntersectionObserverWithDelay';
import { logEvent } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseLessonNavigationUrl,
  getVerseReflectionNavigationUrl,
} from '@/utils/navigation';
import ContentType from 'types/QuranReflect/ContentType';

const ReflectionSurahAndAyahSelection = dynamic(() => import('./ReflectionSurahAndAyahSelection'));
const ReflectionBody = dynamic(() => import('./ReflectionBody'), {
  loading: TafsirSkeleton,
});

type ReflectionBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  scrollToTop: () => void;
  render: (renderProps: {
    surahAndAyahSelection: JSX.Element;
    languageSelection: JSX.Element;
    body: JSX.Element;
  }) => JSX.Element;
  initialContentType?: ContentType;
  isModal?: boolean;
  showEndActions?: boolean;
  showTabs?: boolean;
};

const ReflectionBodyContainer = ({
  render,
  initialChapterId,
  initialVerseNumber,
  scrollToTop,
  initialContentType = ContentType.REFLECTIONS,
  isModal = false,
  showEndActions = true,
  showTabs = true,
}: ReflectionBodyProps) => {
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedVerseNumber, setSelectedVerseNumber] = useState(initialVerseNumber);
  const [selectedContentType, setSelectedContentType] = useState(initialContentType);

  // Sync local state when initial props change (e.g., when navigating verses in Study Mode)
  useEffect(() => {
    setSelectedChapterId(initialChapterId);
    setSelectedVerseNumber(initialVerseNumber);
  }, [initialChapterId, initialVerseNumber]);

  // Sync content type when initial prop changes
  useEffect(() => {
    setSelectedContentType(initialContentType);
  }, [initialContentType]);

  const { lang, t } = useTranslation();
  const {
    items,
    sortBy,
    onSortChange,
    sortOptions,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    onLikeToggle,
    onFollow,
    retry,
    isLikeLoading,
    isFollowLoading,
  } = useQuranReflectFeed({
    chapterId: selectedChapterId,
    verseNumber: selectedVerseNumber,
    contentType: selectedContentType,
  });

  const handleTabChange = (value: ContentType) => {
    logEvent('reflection_view_tab_change', { tab: value });
    setSelectedContentType(value);
    const verseKey = `${selectedChapterId}:${selectedVerseNumber}`;
    const newUrl =
      value === ContentType.REFLECTIONS
        ? getVerseReflectionNavigationUrl(verseKey)
        : getVerseLessonNavigationUrl(verseKey);
    fakeNavigate(newUrl, lang);
  };

  useGlobalIntersectionObserverWithDelay(
    { threshold: 1 },
    handleReflectionViewed,
    REFLECTIONS_OBSERVER_ID,
    'postId',
    'countAsViewedAfter',
  );

  const bodyContent = (
    <ReflectionBody
      items={items}
      selectedChapterId={selectedChapterId}
      selectedVerseNumber={selectedVerseNumber}
      setSelectedVerseNumber={setSelectedVerseNumber}
      scrollToTop={scrollToTop}
      selectedContentType={selectedContentType}
      isModal={isModal}
      hideEndActions={!showEndActions}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      error={error}
      onLoadMore={loadMore}
      onRetry={retry}
      onLikeToggle={onLikeToggle}
      onFollow={onFollow}
      isLikeLoading={isLikeLoading}
      isFollowLoading={isFollowLoading}
    />
  );

  const body = (
    <div className={styles.tabsContainerWrapper}>
      <EbookBanner
        disableDesktop
        context={
          initialContentType === ContentType.LESSONS
            ? EbookBannerContext.LESSONS
            : EbookBannerContext.REFLECTIONS
        }
        containerClassName={styles.bannerContainer}
      />
      <StudyModeChapterBanner
        disableDesktop
        chapterId={selectedChapterId}
        containerClassName={styles.bannerContainer}
        context={
          initialContentType === ContentType.LESSONS
            ? EbookBannerContext.LESSONS
            : EbookBannerContext.REFLECTIONS
        }
      />
      {showTabs && (
        <Tabs
          tabs={getReflectionTabs(t, isModal)}
          selected={selectedContentType}
          onSelect={handleTabChange}
          className={styles.tab}
          containerClassName={styles.tabsContainer}
          activeClassName={styles.tabActive}
        />
      )}
      {isModal && showTabs ? (
        <div className={styles.reflectionDataContainer}>{bodyContent}</div>
      ) : (
        bodyContent
      )}
    </div>
  );

  const languageSelection = (
    <div
      className={styles.sortChips}
      role="group"
      aria-label={t('quran-reader:reflection-feed.sort.label')}
    >
      {sortOptions.map((option) => (
        <Button
          key={option.id}
          size={ButtonSize.XSmall}
          shape={ButtonShape.Pill}
          hasSidePadding={false}
          className={classNames(styles.sortChip, {
            [styles.sortChipSelected]: sortBy === option.id,
            [styles.sortChipDefault]: sortBy !== option.id,
          })}
          contentClassName={styles.sortChipContent}
          isSelected={sortBy === option.id}
          aria-pressed={sortBy === option.id}
          onClick={() => onSortChange(option.id)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );

  return render({
    surahAndAyahSelection: (
      <ReflectionSurahAndAyahSelection
        selectedChapterId={selectedChapterId}
        selectedVerseNumber={selectedVerseNumber}
        setSelectedChapterId={setSelectedChapterId}
        setSelectedVerseNumber={setSelectedVerseNumber}
        selectedContentType={selectedContentType}
      />
    ),
    languageSelection,
    body,
  });
};

export default ReflectionBodyContainer;
