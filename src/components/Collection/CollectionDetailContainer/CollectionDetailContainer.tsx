import { useEffect } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useSWRInfinite from 'swr/infinite';

import layoutStyles from '../../../pages/index.module.scss';

import styles from './CollectionDetailContainer.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import ArrowLeft from '@/icons/west.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getCanonicalUrl,
  getCollectionNavigationUrl,
  getProfileNavigationUrl,
} from '@/utils/navigation';
import CollectionDetail from 'src/components/Collection/CollectionDetail/CollectionDetail';
import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import DataContext from 'src/contexts/DataContext';
import Error from 'src/pages/_error';
import {
  deleteBookmarkById,
  deleteCollectionBookmarkById,
  privateFetcher,
} from 'src/utils/auth/api';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import Chapter from 'types/Chapter';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

type CollectionDetailContainerProps = {
  chaptersData: Record<string, Chapter>;
  title?: string;
  getSWRKey: (pageIndex, previousData) => string;
  onSortByChange: (newVal) => void;
  sortBy: CollectionDetailSortOption;
  shouldDeleteBookmark?: boolean; // should delete the bookmark instead of just deleting the connection between the bookmark and collection
};
const CollectionDetailContainer = ({
  chaptersData,
  title,
  getSWRKey,
  onSortByChange,
  sortBy,
  shouldDeleteBookmark,
}: CollectionDetailContainerProps) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const collectionId = router.query.collectionId as string;
  const toast = useToast();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/');
    }
  }, [router]);

  const { data, size, setSize, mutate, isValidating, error } =
    useSWRInfinite<GetBookmarkCollectionsIdResponse>(getSWRKey, privateFetcher);

  if (error) {
    return <Error statusCode={403} />;
  }

  if (!data) {
    return (
      <div className={classNames(styles.container, styles.loadingContainer)}>
        <Spinner shouldDelayVisibility size={SpinnerSize.Large} />
      </div>
    );
  }

  const onUpdated = () => {
    mutate();
  };

  const lastPageData = data[data.length - 1];
  const { hasNextPage } = lastPageData.pagination;

  const bookmarks = data.map((response) => response.data.bookmarks).flat();
  const collectionTitle = title || data[0].data.collection.name;

  const loadMore = () => {
    setSize(size + 1);
    logButtonClick('collection_detail_page_load_more');
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

  const isLoadingMoreData = bookmarks?.length > 0 && size > 1 && isValidating;

  return (
    <DataContext.Provider value={chaptersData}>
      <NextSeoWrapper
        title={collectionTitle}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        nofollow
        noindex
      />
      <div className={layoutStyles.pageContainer}>
        <div className={layoutStyles.flow}>
          <div className={layoutStyles.flowItem}>
            <div className={styles.container}>
              <Button
                href={getProfileNavigationUrl()}
                variant={ButtonVariant.Ghost}
                hasSidePadding={false}
              >
                <ArrowLeft />
              </Button>
              <CollectionDetail
                id={collectionId}
                title={collectionTitle}
                bookmarks={bookmarks}
                sortBy={sortBy}
                onSortByChange={onSortByChange}
                onUpdated={onUpdated}
                onItemDeleted={onItemDeleted}
              />
              {isLoadingMoreData && <Spinner size={SpinnerSize.Large} />}
              {hasNextPage && (
                <div className={styles.loadMoreContainer}>
                  <Button onClick={loadMore}>{t('collection:load-more')}</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DataContext.Provider>
  );
};

export default CollectionDetailContainer;
