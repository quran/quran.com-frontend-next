import { useCallback, useContext, useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSWRConfig } from 'swr';

import modalStyles from '../Modal.module.scss';

import MyNotes from '@/components/Notes/modal/MyNotes/MyNotes';
import myNotesStyles from '@/components/Notes/modal/MyNotes/MyNotes.module.scss';
import PostQRConfirmationModal from '@/components/Notes/modal/PostQrConfirmationModal';
import { invalidateCache } from '@/components/Notes/modal/utility';
import DataContext from '@/contexts/DataContext';
import ContentModal from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useMutation from '@/hooks/useMutation';
import ArrowIcon from '@/icons/arrow.svg';
import { logErrorToSentry } from '@/lib/sentry';
import { Note } from '@/types/auth/Note';
import { publishNoteToQR } from '@/utils/auth/api';
import { toLocalizedNumber } from '@/utils/locale';
import { verseRangesToVerseKeys } from '@/utils/verseKeys';

interface MyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  notesCount?: number;
  verseKey: string;
}

const MyNotesModal: React.FC<MyNotesModalProps> = ({
  isOpen,
  onClose,
  onAddNote,
  onEditNote,
  notesCount = 0,
  verseKey,
}) => {
  const { t, lang } = useTranslation('notes');

  const toast = useToast();
  const chaptersData = useContext(DataContext);
  const { mutate, cache } = useSWRConfig();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [noteToPost, setNoteToPost] = useState<Note | null>(null);

  const { mutate: postNoteToQRMutation, isMutating: isPosting } = useMutation<
    { success: boolean; postId: string },
    { note: Note }
  >(async ({ note }) => publishNoteToQR(note.id, { body: note.body, ranges: note.ranges }), {
    // we are not using response from the mutation so we can safely ignore the warning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (response, variables) => {
      if (!variables?.note) return;
      toast(t('export-success'), { status: ToastStatus.Success });

      invalidateCache({
        mutate,
        cache,
        note: variables.note,
        verseKeys: variables.note.ranges
          ? verseRangesToVerseKeys(chaptersData, variables.note.ranges)
          : [],
      });

      setShowConfirmationModal(false);
      setNoteToPost(null);
    },
    onError: (error, variables) => {
      toast(t('common:error.general'), { status: ToastStatus.Error });
      logErrorToSentry(error, {
        transactionName: 'postNoteToQR',
        metadata: { noteId: variables?.note?.id },
      });
    },
  });

  const handlePostToQrClick = useCallback((note: Note) => {
    setNoteToPost(note);
    setShowConfirmationModal(true);
  }, []);

  const handleNotePostToQRClose = useCallback(() => {
    setShowConfirmationModal(false);
    setNoteToPost(null);
  }, []);

  const handleNotePostToQR = useCallback(async () => {
    if (!noteToPost) return;
    await postNoteToQRMutation({ note: noteToPost });
  }, [noteToPost, postNoteToQRMutation]);

  return (
    <>
      <ContentModal
        isOpen={isOpen && !showConfirmationModal}
        onClose={onClose}
        onEscapeKeyDown={onClose}
        hasCloseButton
        overlayClassName={modalStyles.overlay}
        headerClassName={modalStyles.headerClassName}
        closeIconClassName={modalStyles.cloneIconContainer}
        contentClassName={classNames(modalStyles.content, modalStyles.myNotesModalContent)}
        innerContentClassName={myNotesStyles.container}
        dataTestId="my-notes-modal-content"
        header={
          <button
            type="button"
            className={classNames(modalStyles.headerButton, modalStyles.title)}
            onClick={onAddNote}
            data-testid="my-notes-modal-title"
            data-note-count={notesCount}
          >
            <IconContainer
              icon={<ArrowIcon />}
              shouldForceSetColors={false}
              size={IconSize.Custom}
              className={modalStyles.arrowIcon}
            />

            {t('my-notes', { count: toLocalizedNumber(notesCount, lang) })}
          </button>
        }
      >
        <MyNotes
          onAddNote={onAddNote}
          onEditNote={onEditNote}
          verseKey={verseKey}
          onPostToQrClick={handlePostToQrClick}
        />
      </ContentModal>

      <PostQRConfirmationModal
        isModalOpen={showConfirmationModal}
        isLoading={isPosting}
        onModalClose={handleNotePostToQRClose}
        onConfirm={handleNotePostToQR}
      />
    </>
  );
};

export default MyNotesModal;
