import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import RenameCollectionModal from '../RenameCollectionModal/RenameCollectionModal';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { updateCollection } from 'src/utils/auth/api';

const RenameCollectionAction = ({ currentCollectionName, collectionId, onDone }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onMenuItemClicked = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = (data) => {
    updateCollection(collectionId, { name: data.name }).then(() => {
      onDone();
      setIsModalOpen(false);
    });
  };

  return (
    <>
      <RenameCollectionModal
        onClose={closeModal}
        isOpen={isModalOpen}
        defaultValue={currentCollectionName}
        onSubmit={onSubmit}
      />
      <PopoverMenu.Item shouldStopPropagation onClick={onMenuItemClicked}>
        {t('profile:rename')}
      </PopoverMenu.Item>
    </>
  );
};

export default RenameCollectionAction;
