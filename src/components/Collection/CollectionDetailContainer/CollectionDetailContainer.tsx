/* eslint-disable max-lines */
import { useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';
import useSWRInfinite from 'swr/infinite';

import styles from './CollectionDetailContainer.module.scss';

import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import backButtonStyles from '@/components/MyQuran/CollectionDetailView/CollectionDetailView.module.scss';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import { useOnboarding } from '@/components/Onboarding/OnboardingProvider';
import ShareQuranModal from '@/components/QuranReader/ReadingView/ShareQuranModal';
import StudyModeContainer from '@/components/QuranReader/StudyModeContainer';
import VerseActionModalContainer from '@/components/QuranReader/VerseActionModalContainer';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useBookmarkCacheInvalidator from '@/hooks/useBookmarkCacheInvalidator';
import useDebounceNavbarVisibility from '@/hooks/useDebounceNavbarVisibility';
import ChevronLeft from '@/icons/chevron-left.svg';
import Error from '@/pages/_error';
import { selectNavbar } from '@/redux/slices/navbar';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getCollectionNavigationUrl, ROUTES } from '@/utils/navigation';
import { slugifiedCollectionIdToCollectionId } from '@/utils/string';
import CollectionDetail from 'src/components/Collection/CollectionDetail/CollectionDetail';
import {
  deleteBookmarkById,
  deleteCollectionBookmarkById,
  privateFetcher,
} from 'src/utils/auth/api';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';

type CollectionDetailContainerProps = {
  title?: string;
  getSWRKey: (pageIndex, previousData) => string;
  shouldDeleteBookmark?: boolean;
};

const SINGLE_ITEM_COUNT = 1;

const CollectionDetailContainer = ({
  title,
  getSWRKey,
  shouldDeleteBookmark,
}: CollectionDetailContainerProps) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const collectionId = router.query.collectionId as string;
  const toast = useToast();
  const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();

  const { isActive } = useOnboarding();
  const { isVisible: isNavbarVisible } = useSelector(selectNavbar, shallowEqual);
  const isNavbarShown = useDebounceNavbarVisibility(isNavbarVisible, isActive);

  // State for managing which bookmark card is expanded
  const [expandedBookmarkId, setExpandedBookmarkId] = useState<Set<string>>(new Set());
  const [shareVerseKey, setShareVerseKey] = useState<string | null>(null);

  const { data, size, setSize, mutate, isValidating, error } =
    useSWRInfinite<GetBookmarkCollectionsIdResponse>(getSWRKey, privateFetcher);

  const onUpdated = () => {
    mutate();
    invalidateAllBookmarkCaches();
  };

  const lastPageData = data?.at(-1);
  const hasNextPage = !!lastPageData?.pagination?.hasNextPage;

  const bookmarks = data?.map((response) => response.data.bookmarks).flat() || [];
  const collectionTitle = title || data?.[0]?.data?.collection?.name;
  const isOwner = data?.[0]?.data?.isOwner;

  const loadMore = () => {
    setSize(size + 1);
    logButtonClick('collection_detail_page_load_more', {
      collectionId: slugifiedCollectionIdToCollectionId(collectionId),
      page: size + 1,
    });
  };

  const navigationUrl = getCollectionNavigationUrl(collectionId);

  const onItemDeleted = (bookmarkId: string) => {
    if (shouldDeleteBookmark) {
      deleteBookmarkById(bookmarkId)
        .then(() => {
          onUpdated();
          toast(
            t('collection:delete-bookmark.success', {
              count: toLocalizedNumber(SINGLE_ITEM_COUNT, lang),
            }),
            { status: ToastStatus.Success },
          );
        })
        .catch(() => toast(t('common:error.general'), { status: ToastStatus.Error }));
    } else {
      deleteCollectionBookmarkById(collectionId, bookmarkId)
        .then(() => {
          onUpdated();
          toast(
            t('collection:delete-bookmark.success', {
              count: toLocalizedNumber(SINGLE_ITEM_COUNT, lang),
            }),
            { status: ToastStatus.Success },
          );
        })
        .catch(() => toast(t('common:error.general'), { status: ToastStatus.Error }));
    }
  };

  // Handler to toggle card expansion
  const onToggleCardExpansion = (bookmarkId: string) => {
    setExpandedBookmarkId((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId);
      } else {
        newSet.add(bookmarkId);
      }
      return newSet;
    });
  };

  // Check if a specific card is expanded
  const isCardExpanded = (bookmarkId: string) => expandedBookmarkId.has(bookmarkId);

  const handleShareVerse = (verseKey: string) => {
    setShareVerseKey(verseKey);
  };

  const handleShareModalClose = () => {
    setShareVerseKey(null);
  };

  const handleBackClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(ROUTES.COLLECTIONS_ALL);
  };

  if (error && !isValidating) {
    return <Error hasFullWidth={false} />;
  }

  if (isValidating && !data) {
    return (
      <div className={styles.statusContainer} data-status="loading">
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  return (
    <>
      <NextSeoWrapper
        title={collectionTitle}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        nofollow
        noindex
      />

      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.stickyHeader} data-navbar-visible={isNavbarShown}>
            <Button
              onClick={handleBackClick}
              variant={ButtonVariant.Ghost}
              className={classNames(backButtonStyles.backButton, styles.backButton)}
            >
              <ChevronLeft />
              <span>{collectionTitle}</span>
            </Button>
          </div>

          <CollectionDetail
            id={slugifiedCollectionIdToCollectionId(collectionId)}
            title={collectionTitle}
            bookmarks={bookmarks}
            onItemDeleted={onItemDeleted}
            onShareVerse={handleShareVerse}
            isOwner={isOwner}
            onToggleCardExpansion={onToggleCardExpansion}
            isCardExpanded={isCardExpanded}
            shouldUseBodyScroll
          />

          {isValidating && (
            <div className={styles.statusContainer} data-status="validating">
              <Spinner size={SpinnerSize.Large} />
            </div>
          )}

          {hasNextPage && !isValidating && (
            <div className={styles.statusContainer} data-status="load-more">
              <Button onClick={loadMore}>{t('collection:load-more')}</Button>
            </div>
          )}
        </div>
      </div>

      <StudyModeContainer />
      <VerseActionModalContainer />
      <ShareQuranModal
        isOpen={!!shareVerseKey}
        onClose={handleShareModalClose}
        verse={shareVerseKey ? { verseKey: shareVerseKey } : undefined}
      />
    </>
  );
};

export default CollectionDetailContainer;
