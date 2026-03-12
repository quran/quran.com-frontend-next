import type React from 'react';

import useTranslation from 'next-translate/useTranslation';

import DeleteConfirmationModal from '@/dls/DeleteConfirmationModal';
import { toLocalizedNumber } from '@/utils/locale';

type DeleteBookmarkModalProps = {
  isOpen: boolean;
  collectionName: string;
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

const DeleteBookmarkModal: React.FC<DeleteBookmarkModalProps> = ({
  isOpen,
  collectionName,
  count,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { t, lang } = useTranslation('collection');

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      title={t('delete-bookmark.title')}
      subtitle={t('delete-bookmark.confirmation-subtitle', {
        count: toLocalizedNumber(count, lang),
        collectionName,
      })}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};

export default DeleteBookmarkModal;
