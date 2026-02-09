import { useCallback, useMemo, useState } from 'react';

import Bookmark from '@/types/Bookmark';
import { logButtonClick } from '@/utils/eventLogger';

interface UseCollectionSelectionParams {
  filteredBookmarks: Bookmark[];
  numericCollectionId: string;
}

const useCollectionSelection = ({
  filteredBookmarks,
  numericCollectionId,
}: UseCollectionSelectionParams) => {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  const isAllExpanded = useMemo(() => {
    return filteredBookmarks.length > 0 && expandedCardIds.size === filteredBookmarks.length;
  }, [expandedCardIds, filteredBookmarks.length]);

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => {
      const next = !prev;
      if (prev) setSelectedBookmarks(new Set());
      logButtonClick('collection_detail_toggle_select_mode', {
        collectionId: numericCollectionId,
        isEntering: next,
      });
      return next;
    });
  }, [numericCollectionId]);

  const handleToggleExpandCollapseAll = useCallback(() => {
    const allIds = new Set(filteredBookmarks.map((b) => b.id));
    const params = { collectionId: numericCollectionId };

    if (isAllExpanded) {
      setExpandedCardIds(new Set());
      logButtonClick('collection_detail_collapse_all', params);
    } else {
      setExpandedCardIds(allIds);
      logButtonClick('collection_detail_expand_all', params);
    }
  }, [filteredBookmarks, isAllExpanded, numericCollectionId]);

  const handleToggleBookmarkSelection = useCallback((bookmarkId: string) => {
    setSelectedBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) next.delete(bookmarkId);
      else next.add(bookmarkId);
      return next;
    });
  }, []);

  const handleToggleCardExpansion = useCallback((bookmarkId: string) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) next.delete(bookmarkId);
      else next.add(bookmarkId);
      return next;
    });
  }, []);

  const removeBookmarkIdsFromState = useCallback((bookmarkIds: string[]) => {
    setSelectedBookmarks((prev) => {
      const next = new Set(prev);
      bookmarkIds.forEach((id) => next.delete(id));
      return next;
    });
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      bookmarkIds.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const isCardExpanded = useCallback(
    (bookmarkId: string) => expandedCardIds.has(bookmarkId),
    [expandedCardIds],
  );

  const isBookmarkSelected = useCallback(
    (bookmarkId: string) => selectedBookmarks.has(bookmarkId),
    [selectedBookmarks],
  );

  return {
    isSelectMode,
    selectedBookmarks,
    expandedCardIds,
    isAllExpanded,
    toggleSelectMode,
    handleToggleExpandCollapseAll,
    handleToggleBookmarkSelection,
    handleToggleCardExpansion,
    removeBookmarkIdsFromState,
    isCardExpanded,
    isBookmarkSelected,
  };
};

export default useCollectionSelection;
