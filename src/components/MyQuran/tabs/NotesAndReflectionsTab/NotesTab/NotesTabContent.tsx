import { useCallback, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import styles from '../NotesAndReflectionsTab.module.scss';

import CardsSkeleton from '@/components/MyQuran/Skeleton';
import EditNoteModal from '@/components/Notes/modal/EditNoteModal';
import NoteCard from '@/components/Notes/modal/MyNotes/Card/NoteCard';
import useDeleteNote from '@/components/Notes/modal/MyNotes/useDeleteNote';
import usePostNoteToQR from '@/components/Notes/modal/MyNotes/usePostNoteToQr';
import PostQRConfirmationModal from '@/components/Notes/modal/PostQrConfirmationModal';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { AttachedEntityType, Note } from '@/types/auth/Note';
import ZIndexVariant from '@/types/enums/ZIndexVariant';
import { getQuranReflectPostUrl } from '@/utils/quranReflect/navigation';

type NoteWithPostUrl = Note & { postUrl?: string };

interface NotesTabContentProps {
  notes: Note[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: any;
  loadMore: () => void;
}

enum ModalState {
  Add = 'add',
  Edit = 'edit',
}

const NotesTabContent: React.FC<NotesTabContentProps> = ({
  notes,
  isLoading,
  isLoadingMore,
  error,
  loadMore,
}) => {
  const { t } = useTranslation('notes');

  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const {
    showConfirmationModal,
    isPosting,
    handlePostToQrClick,
    handleNotePostToQRClose,
    handleNotePostToQR,
  } = usePostNoteToQR();

  const { noteToDelete, isDeletingNote, handleDeleteNoteClick } = useDeleteNote();

  const notesWithPostUrl = useMemo((): NoteWithPostUrl[] => {
    return notes.map((note) => {
      const attachedEntities = note.attachedEntities || [];
      const attachedEntity = attachedEntities
        .slice()
        .reverse()
        .find((entity) => entity.type === AttachedEntityType.REFLECTION);

      const postUrl = attachedEntity ? getQuranReflectPostUrl(attachedEntity.id) : undefined;
      return { ...note, postUrl };
    });
  }, [notes]);

  const handleEditNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setModalState(ModalState.Edit);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState(null);
  }, []);

  const renderNote = useCallback(
    (index: number, note: NoteWithPostUrl) => {
      return (
        <div className={styles.noteItem}>
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleEditNote}
            onPostToQr={handlePostToQrClick}
            onDelete={handleDeleteNoteClick}
            isDeletingNote={isDeletingNote ? note.id === noteToDelete?.id : false}
          />
        </div>
      );
    },
    [handleEditNote, handlePostToQrClick, handleDeleteNoteClick, noteToDelete, isDeletingNote],
  );

  if (error) {
    return (
      <div className={styles.statusContainer} data-error="true">
        {t('common:error.general')}
      </div>
    );
  }

  const isEmpty = !isLoading && notes.length === 0;

  if (isEmpty) {
    return (
      <div className={styles.statusContainer}>
        <div className={styles.emptyState}>
          <p>{t('empty-notes')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Virtuoso
        data={notesWithPostUrl}
        overscan={10}
        increaseViewportBy={{ top: 10, bottom: 10 }}
        endReached={loadMore}
        itemContent={renderNote}
        useWindowScroll
      />

      {(isLoadingMore || isLoading) && <CardsSkeleton count={5} />}

      <EditNoteModal
        isModalOpen={modalState === ModalState.Edit}
        onModalClose={handleCloseModal}
        onMyNotes={handleCloseModal}
        note={selectedNote}
      />

      <PostQRConfirmationModal
        isModalOpen={showConfirmationModal}
        isLoading={isPosting}
        onModalClose={handleNotePostToQRClose}
        onConfirm={handleNotePostToQR}
      />

      <ConfirmationModal zIndexVariant={ZIndexVariant.ULTRA} />
    </>
  );
};

export default NotesTabContent;
