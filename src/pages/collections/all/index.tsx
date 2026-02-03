import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import withAuth from '@/components/Auth/withAuth';
import CollectionDetailContainer from '@/components/Collection/CollectionDetailContainer/CollectionDetailContainer';
import BookmarkType from '@/types/BookmarkType';
import { isLoggedIn } from '@/utils/auth/login';
import { makeAllCollectionsItemsUrl } from 'src/utils/auth/apiPaths';
import { getAllChaptersData } from 'src/utils/chapter';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

const CollectionDetailPage = () => {
  const { t } = useTranslation();

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
        sortBy: CollectionDetailSortOption.VerseKey,
        type: BookmarkType.Ayah,
      });
    }
    const cursor = previousPageData.pagination?.endCursor;
    return makeAllCollectionsItemsUrl({
      sortBy: CollectionDetailSortOption.VerseKey,
      cursor,
      type: BookmarkType.Ayah,
    });
  };

  return (
    <CollectionDetailContainer
      title={t('collection:all-saved-verses')}
      getSWRKey={getKey}
      shouldDeleteBookmark
    />
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);
  return { props: { chaptersData: allChaptersData } };
};

export default withAuth(CollectionDetailPage);
