import CollectionList from './CollectionList';

export default {
  title: 'collection/CollectionList',
  component: CollectionList,
};

export const Example = () => {
  return (
    <CollectionList
      collections={[
        {
          id: 1,
          name: 'All Saved Verses',
          itemCount: 56,
        },
        {
          id: 2,
          name: 'Friday Recitations',
          itemCount: 56,
        },
        {
          id: 3,
          name: 'Woman in Quran',
          itemCount: 56,
        },
        {
          id: 4,
          name: 'Motivations',
          itemCount: 56,
        },
      ]}
    />
  );
};
