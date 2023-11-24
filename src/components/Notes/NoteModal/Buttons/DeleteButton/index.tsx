import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import TrashIcon from '@/icons/trash.svg';
import { logButtonClick } from '@/utils/eventLogger';

type Props = {
  noteId: string;
  isDeletingNote: boolean;
  deleteNote: (noteId: string) => void;
};

const DeleteButton: React.FC<Props> = ({ noteId, isDeletingNote, deleteNote }) => {
  const { t } = useTranslation('common');

  const onDeleteClicked = (id: string) => {
    logButtonClick('delete_note');
    deleteNote(id);
  };
  return (
    <Button
      type={ButtonType.Error}
      variant={ButtonVariant.Ghost}
      onClick={() => onDeleteClicked(noteId)}
      isLoading={isDeletingNote}
      htmlType="button"
      tooltip={t('notes:delete-note')}
    >
      <TrashIcon />
    </Button>
  );
};

export default DeleteButton;
