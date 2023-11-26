import useTranslation from 'next-translate/useTranslation';

import styles from './NoteModal.module.scss';

import Button, { ButtonType, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import ChatIcon from '@/icons/chat.svg';
import TrashIcon from '@/icons/trash.svg';
import { Note } from '@/types/auth/Note';
import { deleteNote as baseDeleteNote, postToQR } from '@/utils/auth/api';
import { logButtonClick } from '@/utils/eventLogger';

interface NoteActionsProps {
  note?: Note;
  body: string;

  onDeleted?: () => void;

  isSubmitting: boolean;
}

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

const NoteActions = ({ note, onDeleted, isSubmitting, body }: NoteActionsProps) => {
  const { t } = useTranslation();
  const toast = useToast();

  const { mutate: deleteNote, isMutating: isDeletingNote } = useMutation<unknown, string>(
    async (id) => {
      return baseDeleteNote(id);
    },
    {
      onSuccess: () => {
        toast(t('notes:delete-success'), {
          status: ToastStatus.Success,
        });
        onDeleted?.();
      },
      onError: () => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      },
    },
  );

  const { mutate: postOnQuranReflect, isMutating: isPostingOnQuranReflect } = useMutation(
    () => {
      return postToQR({
        isPrivate: true,
        body,
        ranges: note?.ranges || [],
      });
    },
    {
      onSuccess: () => {
        toast(t('notes:export-success'), {
          status: ToastStatus.Success,
        });
      },
      onError: () => {
        toast(t('common:error.general'), {
          status: ToastStatus.Error,
        });
      },
    },
  );

  const onDeleteClicked = (id: string) => {
    logButtonClick('delete_note');
    deleteNote(id);
  };

  const onExportClicked = () => {
    logButtonClick('export_note_to_qr');
    postOnQuranReflect();
  };

  const shouldDisableActions = isSubmitting || isDeletingNote || isPostingOnQuranReflect;

  return (
    <div className={styles.actionContainer}>
      <Button
        htmlType="submit"
        isLoading={isSubmitting}
        isDisabled={shouldDisableActions}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {t('common:notes.save')}
      </Button>

      {note && (
        <div>
          <Button
            type={ButtonType.Error}
            variant={ButtonVariant.Ghost}
            onClick={() => onDeleteClicked(note.id)}
            htmlType="button"
            tooltip={t('notes:delete-note')}
            isLoading={isDeletingNote}
            isDisabled={shouldDisableActions}
          >
            <TrashIcon />
          </Button>

          {isProduction && (
            <Button
              variant={ButtonVariant.Ghost}
              tooltip={t('notes:share-as-reflection')}
              htmlType="button"
              onClick={onExportClicked}
              isLoading={isPostingOnQuranReflect}
              isDisabled={shouldDisableActions}
            >
              <ChatIcon />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteActions;
