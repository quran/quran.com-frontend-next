import { useMemo, useState } from 'react';

import { Virtuoso } from 'react-virtuoso';

import NoteModal from '../../NoteModal';

import styles from './NotesList.module.scss';
import NotesListItem from './NotesListItem';

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
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null); // for the note modal

  const lastPageData = data[data.length - 1];
  const { hasNextPage } = lastPageData.pagination;
  const notes = useMemo(() => {
    return data ? data.map((response) => response.data).flat() : [];
  }, [data]);
  const isLoadingMoreData = notes?.length > 0 && size > 1 && isValidating;

  const loadMore = () => {
    if (!hasNextPage || isValidating) return;
    setSize(size + 1);
  };

  const renderNote = (index: number, note: typeof notes[number]) => {
    return <NotesListItem key={note.id} note={note} setSelectedNoteId={setSelectedNoteId} />;
  };

  const onNoteDeleted = () => {
    // remove the note from the cache
    mutateCache((cachedPages: GetAllNotesResponse[]) => {
      const newPages = cachedPages.map((page) => {
        return {
          ...page,
          data: page.data.filter((note) => note.id !== selectedNoteId),
        };
      });

      return newPages;
    });
  };

  const onNoteUpdated = (updatedNote) => {
    // update the note in the cache
    mutateCache((cachedPages: GetAllNotesResponse[]) => {
      const newPages = cachedPages.map((page) => {
        return {
          ...page,
          data: page.data.map((note) => {
            if (note.id === selectedNoteId) {
              return updatedNote;
            }

            return note;
          }),
        };
      });

      return newPages;
    });
  };

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

      {isLoadingMoreData && <Spinner size={SpinnerSize.Large} />}
    </>
  );
};

export default NotesList;
