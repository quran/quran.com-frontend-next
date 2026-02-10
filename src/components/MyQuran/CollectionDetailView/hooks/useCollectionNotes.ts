import { useCallback, useState } from 'react';

import Bookmark from '@/types/Bookmark';
import { logButtonClick } from '@/utils/eventLogger';
import { makeVerseKey } from '@/utils/verse';

interface UseCollectionNotesParams {
  filteredBookmarks: Bookmark[];
  selectedBookmarks: Set<string>;
  numericCollectionId: string;
}

const useCollectionNotes = ({
  filteredBookmarks,
  selectedBookmarks,
  numericCollectionId,
}: UseCollectionNotesParams) => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalVerseKeys, setNoteModalVerseKeys] = useState<string[]>([]);

  const handleNoteClick = useCallback(() => {
    const verseKeys = filteredBookmarks.map((bookmark) =>
      makeVerseKey(bookmark.key, bookmark.verseNumber),
    );
    setNoteModalVerseKeys(verseKeys);
    setIsNoteModalOpen(true);

    logButtonClick('collection_detail_note_click', {
      collectionId: numericCollectionId,
      selectedCount: selectedBookmarks.size,
      isBulkAction: false,
    });
  }, [filteredBookmarks, numericCollectionId, selectedBookmarks.size]);

  const handleBulkNoteClick = useCallback(() => {
    const verseKeys = filteredBookmarks
      .filter((bookmark) => selectedBookmarks.has(bookmark.id))
      .map((bookmark) => makeVerseKey(bookmark.key, bookmark.verseNumber));

    setNoteModalVerseKeys(verseKeys);
    setIsNoteModalOpen(true);

    logButtonClick('collection_detail_bulk_note_click', {
      collectionId: numericCollectionId,
      selectedCount: selectedBookmarks.size,
    });
  }, [filteredBookmarks, numericCollectionId, selectedBookmarks]);

  const handleNoteModalClose = useCallback(() => {
    setIsNoteModalOpen(false);
    setNoteModalVerseKeys([]);
  }, []);

  return {
    isNoteModalOpen,
    noteModalVerseKeys,
    handleNoteClick,
    handleBulkNoteClick,
    handleNoteModalClose,
  };
};

export default useCollectionNotes;
