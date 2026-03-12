import type React from 'react';

import useTranslation from 'next-translate/useTranslation';

import DeleteConfirmationModal from '@/dls/DeleteConfirmationModal';

interface DeleteNoteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const DeleteNoteModal: React.FC<DeleteNoteModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  onBack,
  isLoading = false,
}) => {
  const { t } = useTranslation('notes');

  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      title={t('delete-note-modal.title')}
      subtitle={t('delete-note-modal.subtitle')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onBack={onBack}
      isLoading={isLoading}
    />
  );
};

export default DeleteNoteModal;
