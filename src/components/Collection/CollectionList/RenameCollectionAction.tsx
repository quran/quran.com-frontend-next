import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import RenameCollectionModal from '../RenameCollectionModal/RenameCollectionModal';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logButtonClick } from '@/utils/eventLogger';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { updateCollection } from 'src/utils/auth/api';

const RenameCollectionAction = ({ currentCollectionName, collectionId, onDone }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toast = useToast();

  const onMenuItemClicked = () => {
    logButtonClick('rename_collection_action_open');
    setIsModalOpen(true);
  };
  const closeModal = () => {
    logButtonClick('rename_collection_action_close');
    setIsModalOpen(false);
  };

  const onSubmit = (data) => {
    logButtonClick('rename_collection_action_submit');
    updateCollection(collectionId, { name: data.name })
      .then(() => {
        onDone();
        setIsModalOpen(false);
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
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
