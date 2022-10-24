import useTranslation from 'next-translate/useTranslation';

import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logButtonClick } from '@/utils/eventLogger';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { deleteCollection } from 'src/utils/auth/api';

const DeleteCollectionAction = ({ collectionId, onDone, collectionName }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();

  const onMenuItemClicked = async () => {
    logButtonClick('rename_collection_action_open');
    const isConfirmed = await confirm({
      confirmText: t('collection:delete'),
      cancelText: t('common:cancel'),
      title: t('collection:delete-collection.title'),
      subtitle: t('collection:delete-collection.subtitle', { collectionName }),
    });

    if (isConfirmed) {
      deleteCollection(collectionId)
        .then(() => {
          onDone();
        })
        .catch(() => {
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
          });
        });
    }
  };

  return <PopoverMenu.Item onClick={onMenuItemClicked}>{t('collection:delete')}</PopoverMenu.Item>;
};

export default DeleteCollectionAction;
