import { useState } from 'react';

import SaveToCollectionModal, { Collection } from './SaveToCollectionModal';

export default {
  title: 'Collection/SaveToCollcationModal',
  component: SaveToCollectionModal,
};

export const Example = () => {
  const [collections, setCollections] = useState([
    {
      name: 'Woman in Quran',
      checked: false,
    },
    {
      name: 'Friday Recitations',
      checked: false,
    },
    {
      name: 'My Motivations 🚀',
      checked: false,
    },
    {
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

  const handleNewCollectionCreated = (name: string) => {
    const nextCollections = [
      ...collections,
      {
        name,
        checked: true,
      },
    ];
    setCollections(nextCollections);
  };

  return (
    <SaveToCollectionModal
      isOpen
      onCollectionToggled={handleCollectionToggled}
      onNewCollectionCreated={handleNewCollectionCreated}
      collections={collections}
    />
  );
};
