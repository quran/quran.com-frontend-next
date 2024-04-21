import { useState } from 'react';

import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import withAuth from '@/components/Auth/withAuth';
import CollectionDetailContainer from '@/components/Collection/CollectionDetailContainer/CollectionDetailContainer';
import { isLoggedIn } from '@/utils/auth/login';
import { logValueChange } from '@/utils/eventLogger';
import { makeAllCollectionsItemsUrl } from 'src/utils/auth/apiPaths';
import { getAllChaptersData } from 'src/utils/chapter';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const CollectionDetailPage = () => {
  const [sortBy, setSortBy] = useState(CollectionDetailSortOption.VerseKey);
  const { t } = useTranslation();

  const onSortByChange = (newSortByVal) => {
    logValueChange('collection_detail_page_sort_by', sortBy, newSortByVal);
    setSortBy(newSortByVal);
  };

  /**
   * Get the SWR key for cursor based pagination
   * - when the page index is still 0 (first fetch). get the bookmarkByCollection url without `cursor` param
   * - on the next fetch, add `cursor` to the parameters
   *
   * corner case
   * - when previous fetch contains empty data, stop fetching
   * - when the user is logged out, don't fetch the data
   *
   * Reference: https://swr.vercel.app/docs/pagination#useswrinfinite
   *
   * @returns {string} swr key
   */
  const getKey = (pageIndex, previousPageData) => {
    if (!isLoggedIn()) return null;
    if (previousPageData && !previousPageData.data) return null;
    if (pageIndex === 0) {
      return makeAllCollectionsItemsUrl({
        sortBy,
      });
    }
    const cursor = previousPageData.pagination?.endCursor;
    return makeAllCollectionsItemsUrl({
      sortBy,
      cursor,
    });
  };

  return (
    <CollectionDetailContainer
      title={t('collection:all-saved-verses')}
      getSWRKey={getKey}
      onSortByChange={onSortByChange}
      sortBy={sortBy}
      shouldDeleteBookmark
    />
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

export default withAuth(CollectionDetailPage);
