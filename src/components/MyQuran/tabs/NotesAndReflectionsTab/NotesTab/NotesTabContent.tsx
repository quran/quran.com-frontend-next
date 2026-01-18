import { useCallback, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import styles from '../NotesAndReflectionsTab.module.scss';

import CardsSkeleton from '@/components/MyQuran/Skeleton';
import EditNoteModal from '@/components/Notes/modal/EditNoteModal';
import useDeleteNote from '@/components/Notes/modal/hooks/useDeleteNote';
import useNotesWithRecentReflection from '@/components/Notes/modal/hooks/useNotesWithRecentReflection';
import usePostNoteToQR from '@/components/Notes/modal/hooks/usePostNoteToQr';
import NoteCard from '@/components/Notes/modal/MyNotes/Card/NoteCard';
import PostQRConfirmationModal from '@/components/Notes/modal/PostQrConfirmationModal';
import { NoteWithRecentReflection } from '@/components/Notes/modal/type';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { Note } from '@/types/auth/Note';
import ZIndexVariant from '@/types/enums/ZIndexVariant';

// It will be used to calculate approximate min height to prevent block size jumping during virtuoso initial calculations
const PROXIMATE_NOTE_HEIGHT = 100;

interface NotesTabContentProps {
  notes: NoteWithRecentReflection[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: any;
  loadMore: (index: number) => void;
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

  const notesWithPostUrl = useNotesWithRecentReflection(notes);

  const handleEditNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setModalState(ModalState.Edit);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState(null);
  }, []);

  const renderNote = useCallback(
    (index: number, note: NoteWithRecentReflection) => {
      return (
        <div className={styles.noteItem}>
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleEditNote}
            onPostToQr={handlePostToQrClick}
            onDelete={handleDeleteNoteClick}
            isDeletingNote={isDeletingNote ? note.id === noteToDelete?.id : false}
            showReadMore
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
      <div style={{ minBlockSize: notesWithPostUrl.length * PROXIMATE_NOTE_HEIGHT }}>
        <Virtuoso
          data={notesWithPostUrl}
          className={styles.virtuosoList}
          overscan={10}
          increaseViewportBy={100}
          endReached={loadMore}
          itemContent={renderNote}
          useWindowScroll
        />
      </div>

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
