import { useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { Virtuoso } from 'react-virtuoso';

import styles from './NotesList.module.scss';
import NotesListItem from './NotesListItem';

import NoteModal from '@/components/Notes/NoteModal';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { GetAllNotesResponse } from '@/types/auth/Note';

interface NotesListProps {
  data: GetAllNotesResponse[];
  isValidating: boolean;
  size: number;
  setSize: (size: number) => void;
  mutateCache: (data: any) => void;
}

const NotesList = ({ data, isValidating, size, setSize, mutateCache }: NotesListProps) => {
  const { t } = useTranslation();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null); // for the note modal

  const lastPageData = data[data.length - 1];
  const { hasNextPage } = lastPageData.pagination;

  const notes = useMemo(() => {
    return data ? data.map((response) => response.data).flat() : [];
  }, [data]);

  const isLoading = !data && isValidating;
  const isLoadingMoreData = notes?.length > 0 && size > 1 && isValidating;
  const isEmpty = !isLoading && notes.length === 0;

  const loadMore = () => {
    if (!hasNextPage || isValidating) return;
    setSize(size + 1);
  };

  const renderNote = (index: number, note: (typeof notes)[number]) => {
    return <NotesListItem key={note.id} note={note} setSelectedNoteId={setSelectedNoteId} />;
  };

  const onNoteDeleted = () => {
    const noteId = selectedNoteId;
    // remove the note from the cache
    mutateCache((cachedPages: GetAllNotesResponse[]) => {
      const newPages = cachedPages;

      for (let i = 0; i < newPages.length; i += 1) {
        const page = newPages[i];
        const newData = page.data.filter((note) => note.id !== noteId);

        if (newData.length !== page.data.length) {
          newPages[i] = {
            ...page,
            data: newData,
          };
          break;
        }
      }

      return newPages;
    });
  };

  const onNoteUpdated = (updatedNote) => {
    const noteId = selectedNoteId;

    // update the note in the cache
    mutateCache((cachedPages: GetAllNotesResponse[]) => {
      const newPages = cachedPages;

      for (let i = 0; i < newPages.length; i += 1) {
        const page = newPages[i];
        const noteIdx = page.data.findIndex((note) => note.id === noteId);

        if (noteIdx !== -1) {
          const newData = [...page.data];
          newData[noteIdx] = updatedNote;

          newPages[i] = {
            ...page,
            data: newData,
          };
          break;
        }
      }

      return newPages;
    });
  };

  let content = null;
  if (isLoadingMoreData || isLoading) {
    content = <Spinner size={SpinnerSize.Large} />;
  } else if (isEmpty) {
    content = (
      <div className={styles.emptyNotesContainer}>
        <span>{t('notes:empty-notes')}</span>
      </div>
    );
  }

  return (
    <>
      {selectedNoteId && (
        <NoteModal
          isOpen
          onClose={() => setSelectedNoteId(null)}
          noteId={selectedNoteId}
          onNoteDeleted={onNoteDeleted}
          onNoteUpdated={onNoteUpdated}
        />
      )}

      <Virtuoso
        data={notes}
        overscan={10}
        increaseViewportBy={{ top: 10, bottom: 10 }}
        className={styles.notesListContainer}
        endReached={loadMore}
        itemContent={renderNote}
        useWindowScroll
      />

      {content}
    </>
  );
};

export default NotesList;
