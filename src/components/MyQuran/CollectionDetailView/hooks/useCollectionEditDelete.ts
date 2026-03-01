import { useCallback, useState } from 'react';

import { ToastFn, TranslateFn } from '../types';

import { ToastStatus } from '@/dls/Toast/Toast';
import { logButtonClick } from '@/utils/eventLogger';

interface UseCollectionEditDeleteParams {
  numericCollectionId: string;
  t: TranslateFn;
  toast: ToastFn;
  invalidateAllBookmarkCaches: () => void;
  onCollectionUpdateRequest?: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDeleteRequest?: (collectionId: string) => Promise<boolean>;
}

const useCollectionEditDelete = ({
  numericCollectionId,
  t,
  toast,
  invalidateAllBookmarkCaches,
  onCollectionUpdateRequest,
  onCollectionDeleteRequest,
}: UseCollectionEditDeleteParams) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
    logButtonClick('collection_detail_edit_click', { collectionId: numericCollectionId });
  }, [numericCollectionId]);

  const handleEditModalClose = useCallback(() => setIsEditModalOpen(false), []);

  const handleEditSubmit = useCallback(
    async (formData: { name: string }) => {
      setIsEditModalOpen(false);
      const success = await onCollectionUpdateRequest?.(numericCollectionId, formData.name);

      if (success) {
        toast(t('collection:edit-collection-success'), { status: ToastStatus.Success });
        logButtonClick('collection_edit_success', { collectionId: numericCollectionId });
      } else {
        // Error toast is expected to be handled by the caller (e.g. useCollections),
        // so we avoid showing a potentially misleading generic message here.
        logButtonClick('collection_edit_failed', { collectionId: numericCollectionId });
      }
    },
    [numericCollectionId, onCollectionUpdateRequest, t, toast],
  );

  const handleDeleteClick = useCallback(() => {
    logButtonClick('collection_detail_delete_click', { collectionId: numericCollectionId });
    setIsDeleteModalOpen(true);
  }, [numericCollectionId]);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    logButtonClick('collection_delete_cancel', { collectionId: numericCollectionId });
  }, [numericCollectionId]);

  const handleDeleteConfirm = useCallback(async () => {
    logButtonClick('collection_delete_confirm', { collectionId: numericCollectionId });
    if (!onCollectionDeleteRequest) return;

    setIsDeleting(true);
    try {
      const success = await onCollectionDeleteRequest(numericCollectionId);
      if (success) {
        setIsDeleteModalOpen(false);
        toast(t('collection:delete-collection-success'), { status: ToastStatus.Success });
        invalidateAllBookmarkCaches();
      } else {
        toast(t('common:error.general'), { status: ToastStatus.Error });
      }
    } catch {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    } finally {
      setIsDeleting(false);
    }
  }, [invalidateAllBookmarkCaches, numericCollectionId, onCollectionDeleteRequest, t, toast]);

  return {
    isEditModalOpen,
    isDeleteModalOpen,
    isDeleting,
    handleEditClick,
    handleEditModalClose,
    handleEditSubmit,
    handleDeleteClick,
    handleDeleteModalClose,
    handleDeleteConfirm,
  };
};

export default useCollectionEditDelete;
