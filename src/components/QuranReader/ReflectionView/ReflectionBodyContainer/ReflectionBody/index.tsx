/* eslint-disable max-lines */
import React, { useCallback, useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './ReflectionBody.module.scss';

import Error from '@/components/Error';
import ReflectionDisclaimerMessage from '@/components/QuranReader/ReflectionView/ReflectionDisclaimerMessage';
import ReflectionItem from '@/components/QuranReader/ReflectionView/ReflectionItem';
import ReflectionNotAvailableMessage from '@/components/QuranReader/ReflectionView/ReflectionNotAvailableMessage';
import TafsirEndOfScrollingActions from '@/components/QuranReader/TafsirView/TafsirEndOfScrollingActions';
import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import Button, { ButtonShape, ButtonSize } from '@/dls/Button/Button';
import Link, { LinkVariant } from '@/dls/Link/Link';
import Separator from '@/dls/Separator/Separator';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getReflectionNavigationUrl } from '@/utils/navigation';
import { getQuranReflectVerseUrl } from '@/utils/quranReflect/navigation';
import { isFirstVerseOfSurah, isLastVerseOfSurah, makeVerseKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import AyahFeedItem from 'types/QuranReflect/AyahFeedItem';
import AyahReflectionsResponse from 'types/QuranReflect/AyahReflectionsResponse';
import ContentType from 'types/QuranReflect/ContentType';

interface Props {
  selectedChapterId: string;
  selectedVerseNumber: string;
  items: AyahFeedItem[];
  scrollToTop: () => void;
  setSelectedVerseNumber: (verseNumber: string) => void;
  selectedContentType: ContentType;
  isModal?: boolean;
  hideEndActions?: boolean;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: unknown;
  onLoadMore: () => void;
  onRetry: () => Promise<AyahReflectionsResponse[] | undefined>;
  onLikeToggle: (post: AyahFeedItem) => Promise<void>;
  onFollow: (post: AyahFeedItem) => Promise<void>;
  isLikeLoading: (postId: number) => boolean;
  isFollowLoading: (username?: string) => boolean;
}

const ReflectionBody: React.FC<Props> = ({
  selectedChapterId,
  selectedVerseNumber,
  items,
  scrollToTop,
  setSelectedVerseNumber,
  selectedContentType,
  isModal = false,
  hideEndActions = false,
  hasMore,
  isLoading,
  isLoadingMore,
  error,
  onLoadMore,
  onRetry,
  onLikeToggle,
  onFollow,
  isLikeLoading,
  isFollowLoading,
}) => {
  const { t, lang } = useTranslation('quran-reader');
  const chaptersData = useContext(DataContext);
  const hasNextVerse = !isLastVerseOfSurah(
    chaptersData,
    selectedChapterId,
    Number(selectedVerseNumber),
  );
  const hasPrevVerse = !isFirstVerseOfSurah(Number(selectedVerseNumber));

  const loadNextVerse = useCallback(() => {
    logButtonClick('reflection_next_verse');
    scrollToTop();
    const newVerseNumber = String(Number(selectedVerseNumber) + 1);
    const verseKey = makeVerseKey(Number(selectedChapterId), Number(newVerseNumber));
    fakeNavigate(getReflectionNavigationUrl(verseKey, selectedContentType), lang);
    setSelectedVerseNumber(newVerseNumber);
  }, [
    lang,
    scrollToTop,
    selectedChapterId,
    selectedVerseNumber,
    setSelectedVerseNumber,
    selectedContentType,
  ]);

  const loadPrevVerse = useCallback(() => {
    const newVerseNumber = String(Number(selectedVerseNumber) - 1);
    logButtonClick('reflection_prev_verse');
    scrollToTop();
    setSelectedVerseNumber(newVerseNumber);
    const verseKey = makeVerseKey(Number(selectedChapterId), Number(newVerseNumber));
    fakeNavigate(getReflectionNavigationUrl(verseKey, selectedContentType), lang);
  }, [
    lang,
    scrollToTop,
    selectedChapterId,
    selectedVerseNumber,
    setSelectedVerseNumber,
    selectedContentType,
  ]);

  const onReadMoreClicked = () => {
    logButtonClick('read_more_reflections');
  };

  if (isLoading) {
    return <TafsirSkeleton />;
  }

  if (error) {
    return <Error error={error as Error} onRetryClicked={onRetry} />;
  }

  return (
    <div className={styles.container}>
      {!isModal && (
        <>
          <VerseAndTranslation
            from={Number(selectedVerseNumber)}
            to={Number(selectedVerseNumber)}
            chapter={Number(selectedChapterId)}
          />
          <div className={styles.separatorContainer}>
            <Separator />
          </div>
        </>
      )}
      {items.length === 0 ? (
        <ReflectionNotAvailableMessage contentType={selectedContentType} />
      ) : (
        <ReflectionDisclaimerMessage contentType={selectedContentType} />
      )}
      {items.map((reflection) => (
        <ReflectionItem
          key={reflection.id}
          reflection={reflection}
          selectedChapterId={selectedChapterId}
          selectedVerseNumber={selectedVerseNumber}
          contentType={selectedContentType}
          onLikeToggle={onLikeToggle}
          onFollow={onFollow}
          isLikeLoading={isLikeLoading(reflection.id)}
          isFollowLoading={isFollowLoading(reflection.author?.username)}
        />
      ))}
      {hasMore && (
        <div className={styles.readMoreButtonContainer}>
          <Button
            onClick={onLoadMore}
            isLoading={isLoadingMore}
            size={ButtonSize.XSmall}
            shape={ButtonShape.Rounded}
            hasSidePadding={false}
            className={styles.loadMoreButton}
            contentClassName={styles.loadMoreButtonContent}
          >
            {t('reflection-feed.load-more')}
          </Button>
        </div>
      )}
      <div className={styles.engageLinkContainer}>
        <Link
          href={getQuranReflectVerseUrl(selectedChapterId, selectedVerseNumber)}
          onClick={onReadMoreClicked}
          isNewTab
          variant={LinkVariant.Highlight}
          className={styles.engageLink}
        >
          {t('reflection-feed.engage')}
        </Link>
      </div>

      {!hideEndActions && (
        <div className={styles.endOfScrollActionsContainer}>
          <TafsirEndOfScrollingActions
            hasNextVerseGroup={hasNextVerse}
            hasPrevVerseGroup={hasPrevVerse}
            onNextButtonClicked={loadNextVerse}
            onPreviousButtonClicked={loadPrevVerse}
          />
        </div>
      )}
    </div>
  );
};

export default ReflectionBody;
