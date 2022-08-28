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
          title: 'Al-Maidah (5:13)',
          content: 'Render verse content here',
        },
        {
          title: 'Al-Maidah (5:88)',
          content: 'Render verse content here',
        },
      ]}
    />
  );
};
