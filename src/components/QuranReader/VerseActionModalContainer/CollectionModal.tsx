import React from 'react';

import SaveToCollectionModal, {
  CollectionOption,
} from '@/components/Collection/SaveToCollectionModal/SaveToCollectionModal';

interface CollectionModalProps {
  verseKey: string;
  collections: CollectionOption[];
  wasOpenedFromStudyMode: boolean;
  onClose: () => void;
  onBack?: () => void;
  onCollectionToggled: (collection: CollectionOption, newValue: boolean) => Promise<void>;
  onNewCollectionCreated: (name: string) => Promise<void>;
}

const CollectionModal: React.FC<CollectionModalProps> = ({
  verseKey,
  collections,
  wasOpenedFromStudyMode,
  onClose,
  onBack,
  onCollectionToggled,
  onNewCollectionCreated,
}) => (
  <SaveToCollectionModal
    isOpen
    onCollectionToggled={onCollectionToggled}
    onNewCollectionCreated={onNewCollectionCreated}
    onClose={onClose}
    collections={collections}
    verseKey={verseKey}
    onBack={wasOpenedFromStudyMode ? onBack : undefined}
  />
);

export default CollectionModal;
