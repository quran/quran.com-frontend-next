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
          name: 'All Saved Verses',
          itemCount: 56,
        },
        {
          name: 'Friday Recitations',
          itemCount: 56,
        },
        {
          name: 'Woman in Quran',
          itemCount: 56,
        },
        {
          name: 'Motivations',
          itemCount: 56,
        },
      ]}
    />
  );
};
