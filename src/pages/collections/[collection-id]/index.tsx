import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import styles from './index.module.scss';

import CollectionDetail from 'src/components/Collection/CollectionDetail/CollectionDetail';
import DataContext from 'src/contexts/DataContext';
import { getBookmarksByCollectionId } from 'src/utils/auth/api';
import { makeGetBookmarkByCollectionId } from 'src/utils/auth/apiPaths';
import { getAllChaptersData } from 'src/utils/chapter';

const CollectionDetailPage = ({ chaptersData }) => {
  const router = useRouter();
  const collectionId = router.query['collection-id'] as string;

  const { data } = useSWR(makeGetBookmarkByCollectionId, () =>
    getBookmarksByCollectionId(collectionId),
  );

  if (!data) return null;

  return (
    <DataContext.Provider value={chaptersData}>
      <div className={styles.container}>
        <CollectionDetail title={data.data.collection.name} collectionItems={data.data.bookmarks} />
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
