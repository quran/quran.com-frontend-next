import { useEffect, useState } from 'react';

import { GetStaticPaths, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useSWRInfinite from 'swr/infinite';

import layoutStyles from '../../index.module.scss';

import styles from './index.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import ArrowLeft from '@/icons/west.svg';
import { isLoggedIn } from '@/utils/auth/login';
import { getLanguageAlternates } from '@/utils/locale';
import {
  getCanonicalUrl,
  getCollectionNavigationUrl,
  getProfileNavigationUrl,
} from '@/utils/navigation';
import CollectionDetail from 'src/components/Collection/CollectionDetail/CollectionDetail';
import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import DataContext from 'src/contexts/DataContext';
import { privateFetcher } from 'src/utils/auth/api';
import { makeGetBookmarkByCollectionId } from 'src/utils/auth/apiPaths';
import { getAllChaptersData } from 'src/utils/chapter';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';

const defaultSortOptionId = 'recentlyAdded';

const CollectionDetailPage = ({ chaptersData }) => {
  const { t, lang } = useTranslation();
  const router = useRouter();
  const collectionId = router.query.collectionId as string;

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/');
    }
  }, [router]);

  const [sortBy, setSortBy] = useState(defaultSortOptionId);

  const onSortByChange = (newSortByVal) => {
    setSortBy(newSortByVal);
  };

  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.data) return null;

    // first page, we don't have `previousPageData`
    if (pageIndex === 0) {
      return makeGetBookmarkByCollectionId(collectionId, {
        sortBy,
      });
    }

    const cursor = previousPageData.pagination?.endCursor;
    return makeGetBookmarkByCollectionId(collectionId, {
      sortBy,
      cursor,
    });
  };

  const { data, size, setSize, mutate } = useSWRInfinite<GetBookmarkCollectionsIdResponse>(
    getKey,
    privateFetcher,
  );

  if (!data || data.length === 0) {
    return null;
  }

  const onUpdated = () => {
    mutate();
  };

  const lastPageData = data[data.length - 1];
  const { hasNextPage } = lastPageData.pagination;

  const bookmarks = data.map((response) => response.data.bookmarks).flat();
  const title = data[0].data.collection.name;

  const loadMore = () => {
    setSize(size + 1);
  };

  const navigationUrl = getCollectionNavigationUrl(collectionId);

  return (
    <DataContext.Provider value={chaptersData}>
      <NextSeoWrapper
        title={title}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
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
                title={title}
                bookmarks={bookmarks}
                sortBy={sortBy}
                onSortByChange={onSortByChange}
                onUpdated={onUpdated}
              />
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default CollectionDetailPage;
