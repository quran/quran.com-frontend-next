import useTranslation from 'next-translate/useTranslation';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logButtonClick } from '@/utils/eventLogger';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { deleteCollection } from 'src/utils/auth/api';

const DeleteCollectionAction = ({ collectionId, onDone }) => {
  const { t } = useTranslation();
  const toast = useToast();

  const onMenuItemClicked = () => {
    logButtonClick('rename_collection_action_open');
    deleteCollection(collectionId)
      .then(() => {
        onDone();
      })
      .catch(() => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      });
  };

  return (
    <>
      <PopoverMenu.Item onClick={onMenuItemClicked}>{t('profile:delete')}</PopoverMenu.Item>;
    </>
  );
};

export default DeleteCollectionAction;
