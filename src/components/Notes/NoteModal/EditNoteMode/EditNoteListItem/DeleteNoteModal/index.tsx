import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import { Note } from '@/types/auth/Note';
import { logButtonClick } from '@/utils/eventLogger';

type DeleteNoteButtonProps = {
  isDisabled?: boolean;
  note: Note;
  onConfirm: () => void;
};

const DeleteNoteModal = ({ isDisabled, note: { id }, onConfirm }: DeleteNoteButtonProps) => {
  const { t } = useTranslation('notes');
  const confirm = useConfirm();

  const onDeleteClicked = async () => {
    logButtonClick('note_delete');

    const isConfirmed = await confirm({
      confirmText: t('common:delete'),
      cancelText: t('common:cancel'),
      title: t('delete-note-modal.title'),
      subtitle: t('delete-note-modal.subtitle'),
    });

    if (isConfirmed) {
      logButtonClick('note_delete_confirm', { noteId: id });
      onConfirm();
    } else {
      logButtonClick('note_delete_confirm_cancel', { noteId: id });
    }
  };

  const buttonProps = {
    isDisabled,
    isLoading: isDisabled,
  };

  return (
    <>
      <Button
        variant={ButtonVariant.Ghost}
        onClick={onDeleteClicked}
        tooltip={t('delete')}
        size={ButtonSize.Small}
        type={ButtonType.Warning}
        {...buttonProps}
      >
        X
      </Button>
      <ConfirmationModal />
    </>
  );
};

export default DeleteNoteModal;
