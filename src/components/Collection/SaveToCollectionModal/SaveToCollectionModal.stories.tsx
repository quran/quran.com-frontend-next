import { useState } from 'react';

import SaveToCollectionModal, { Collection } from './SaveToCollectionModal';

export default {
  title: 'Collection/SaveToCollcationModal',
  component: SaveToCollectionModal,
};

export const Example = () => {
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: 'Woman in Quran',
      checked: false,
    },
    {
      id: 2,
      name: 'Friday Recitations',
      checked: false,
    },
    {
      id: 3,
      name: 'My Motivations 🚀',
      checked: false,
    },
    {
      id: 4,
      name: 'School Project: The story of Ibrahim',
      checked: false,
    },
  ]);

  const handleCollectionToggled = (toggledCollection: Collection) => {
    const nextCollections = collections.map((collection) => {
      if (toggledCollection.name === collection.name) {
        return {
          ...collection,
          checked: !collection.checked,
        };
      }
      return collection;
    });
    setCollections(nextCollections);
  };

  return (
    <SaveToCollectionModal
      isOpen
      onCollectionToggled={handleCollectionToggled}
      onNewCollectionCreated={() => {
        // do nothing here. Will be implemented on the real code base
      }}
      collections={collections}
    />
  );
};
