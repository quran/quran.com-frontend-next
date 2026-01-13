import React, { useCallback } from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import DeleteIcon from '@/icons/delete.svg';
import { Note } from '@/types/auth/Note';
import { logButtonClick } from '@/utils/eventLogger';

interface DeleteNoteButtonProps {
  note: Note;
  onDeleteNoteClick: (note: Note) => void;
  isDeletingNote: boolean;
}

const DeleteNoteButton: React.FC<DeleteNoteButtonProps> = ({
  note,
  onDeleteNoteClick,
  isDeletingNote,
}) => {
  const { t } = useTranslation('notes');

  const handleDeleteNote = useCallback(() => {
    logButtonClick('note_delete');
    onDeleteNoteClick(note);
  }, [note, onDeleteNoteClick]);

  return (
    <Button
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
      shape={ButtonShape.Square}
      onClick={handleDeleteNote}
      isDisabled={isDeletingNote}
      tooltip={t('common:delete')}
      ariaLabel={t('common:delete')}
      data-testid="delete-note-button"
    >
      <IconContainer
        size={IconSize.Xsmall}
        shouldForceSetColors={false}
        icon={
          isDeletingNote ? (
            <Spinner shouldDelayVisibility={false} size={SpinnerSize.Small} />
          ) : (
            <DeleteIcon />
          )
        }
      />
    </Button>
  );
};

export default DeleteNoteButton;
