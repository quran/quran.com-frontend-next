/* eslint-disable max-lines */

import { useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import useSWRInfinite from 'swr/infinite';

import styles from './CollectionDetailContainer.module.scss';

import Button, { ButtonVariant } from '@/components/dls/Button/Button';
import Error from '@/components/Error';
import backButtonStyles from '@/components/MyQuran/CollectionDetailView/CollectionDetailView.module.scss';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import StudyModeContainer from '@/components/QuranReader/StudyModeContainer';
import VerseActionModalContainer from '@/components/QuranReader/VerseActionModalContainer';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useBookmarkCacheInvalidator from '@/hooks/useBookmarkCacheInvalidator';
import ChevronLeft from '@/icons/chevron-left.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getCanonicalUrl,
  getCollectionNavigationUrl,
  getProfileNavigationUrl,
} from '@/utils/navigation';
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

  // State for managing which bookmark card is expanded
  const [expandedBookmarkId, setExpandedBookmarkId] = useState<Set<string>>(new Set());

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
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        });
    } else {
      deleteCollectionBookmarkById(collectionId, bookmarkId)
        .then(() => {
          onUpdated();
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        });
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
  const isCardExpanded = (bookmarkId: string) => {
    return expandedBookmarkId.has(bookmarkId);
  };

  const isLoading = !data && !error;
  const isValidatingOrLoading = isValidating || isLoading;
  const isError = !!error && !isValidatingOrLoading;

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
          <div className={styles.stickyHeader}>
            <Button
              href={getProfileNavigationUrl()}
              variant={ButtonVariant.Ghost}
              className={classNames(backButtonStyles.backButton, styles.backButton)}
            >
              <ChevronLeft />
              <span>{title}</span>
            </Button>
          </div>

          <CollectionDetail
            id={slugifiedCollectionIdToCollectionId(collectionId)}
            title={collectionTitle}
            bookmarks={bookmarks}
            onItemDeleted={onItemDeleted}
            isOwner={isOwner}
            onToggleCardExpansion={onToggleCardExpansion}
            isCardExpanded={isCardExpanded}
            shouldUseBodyScroll
          />

          {isValidatingOrLoading && (
            <div className={styles.statusContainer} data-status="loading">
              <Spinner size={SpinnerSize.Large} />
            </div>
          )}

          {isError && (
            <div className={styles.statusContainer} data-status="error">
              <Error error={error as Error} onRetryClicked={() => mutate()} />
            </div>
          )}

          {!isValidatingOrLoading && !isError && hasNextPage && (
            <div className={styles.statusContainer} data-status="load-more">
              <Button onClick={loadMore}>{t('collection:load-more')}</Button>
            </div>
          )}
        </div>
      </div>

      <StudyModeContainer />
      <VerseActionModalContainer />
    </>
  );
};

export default CollectionDetailContainer;
