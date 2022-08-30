import CollectionDetail from './CollectionDetail';

export default {
  title: 'Collection/CollectionDetail',
  component: CollectionDetail,
};

export const Example = () => {
  return (
    <CollectionDetail
      title="Woman in Quran"
      collectionItems={[
        {
          id: 1,
          title: 'Al-Maidah (5:13)',
          content: 'Render verse content here',
        },
        {
          id: 2,
          title: 'Al-Maidah (5:88)',
          content: 'Render verse content here',
        },
      ]}
    />
  );
};
