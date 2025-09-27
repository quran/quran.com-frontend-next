import { useState } from 'react';

import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import CollectionDetailContainer from '@/components/Collection/CollectionDetailContainer/CollectionDetailContainer';
import BookmarkType from '@/types/BookmarkType';
import { logValueChange } from '@/utils/eventLogger';
import withSsrRedux from '@/utils/withSsrRedux';
import { makeGetBookmarkByCollectionId } from 'src/utils/auth/apiPaths';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const CollectionDetailPage = () => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState(CollectionDetailSortOption.VerseKey);

  const onSortByChange = (newSortByVal) => {
    logValueChange('collection_detail_page_sort_by', sortBy, newSortByVal);
    setSortBy(newSortByVal);
  };

  const collectionId = router.query.collectionId as string;
  /**
   * Get the SWR key for cursor based pagination
   * - when the page index is still 0 (first fetch). the get the bookmarkByCollection url without `cursor` param
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
    if (previousPageData && !previousPageData.data) return null;
    if (pageIndex === 0) {
      return makeGetBookmarkByCollectionId(collectionId, {
        sortBy,
        type: BookmarkType.Ayah,
      });
    }
    const cursor = previousPageData.pagination?.endCursor;
    return makeGetBookmarkByCollectionId(collectionId, {
      sortBy,
      cursor,
      type: BookmarkType.Ayah,
    });
  };

  return (
    <CollectionDetailContainer sortBy={sortBy} getSWRKey={getKey} onSortByChange={onSortByChange} />
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/collections/[collectionId]');

export default CollectionDetailPage;
