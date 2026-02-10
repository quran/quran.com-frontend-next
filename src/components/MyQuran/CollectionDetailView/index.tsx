/* eslint-disable max-lines */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import useSWR, { useSWRConfig } from 'swr';

import styles from './CollectionDetailView.module.scss';
import { getJuzNumberByVerse } from './juzVerseMapping';

import CollectionBulkActionsPopover from '@/components/Collection/CollectionActionsPopover/CollectionBulkActionsPopover';
import CollectionHeaderActionsPopover from '@/components/Collection/CollectionActionsPopover/CollectionHeaderActionsPopover';
import CollectionDetail from '@/components/Collection/CollectionDetail/CollectionDetail';
import CollectionSorter from '@/components/Collection/CollectionSorter/CollectionSorter';
import EditCollectionModal from '@/components/Collection/EditCollectionModal';
import Button, { ButtonSize, ButtonVariant } from '@/components/dls/Button/Button';
import Error from '@/components/Error';
import DeleteCollectionModal from '@/components/MyQuran/DeleteCollectionModal';
import ActiveFiltersChips, {
  type ActiveFilterChip,
} from '@/components/MyQuran/SavedTabContent/ActiveFiltersChips';
import CollectionFiltersDropdown from '@/components/MyQuran/SavedTabContent/CollectionFiltersDropdown';
import AddNoteModal from '@/components/Notes/modal/AddNoteModal';
import StudyModeContainer from '@/components/QuranReader/StudyModeContainer';
import VerseActionModalContainer from '@/components/QuranReader/VerseActionModalContainer';
import { ArrowDirection } from '@/dls/Sorter/Sorter';
import Spinner, { SpinnerSize } from '@/dls/Spinner/Spinner';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import useBookmarkCacheInvalidator from '@/hooks/useBookmarkCacheInvalidator';
import { broadcastPinnedVerses, PinnedVersesBroadcastType } from '@/hooks/usePinnedVersesBroadcast';
import ChevronLeft from '@/icons/chevron-left.svg';
import FilterIcon from '@/icons/filter-bar.svg';
import MenuMoreHorizIcon from '@/icons/menu_more_horiz.svg';
import { logErrorToSentry } from '@/lib/sentry';
import { pinVerses } from '@/redux/slices/QuranReader/pinnedVerses';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { getMushafId } from '@/utils/api';
import { deleteCollectionBookmarkById, privateFetcher, syncPinnedItems } from '@/utils/auth/api';
import { makeGetBookmarkByCollectionId } from '@/utils/auth/apiPaths';
import { buildPinnedSyncPayload, isPinnedItemsCacheKey } from '@/utils/auth/pinnedItems';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick, logValueChange } from '@/utils/eventLogger';
import { toLocalizedNumber } from '@/utils/locale';
import { slugifiedCollectionIdToCollectionId } from '@/utils/string';
import { makeVerseKey, sortByVerseKey } from '@/utils/verse';
import DataContext from 'src/contexts/DataContext';
import { GetBookmarkCollectionsIdResponse } from 'types/auth/GetBookmarksByCollectionId';
import Bookmark from 'types/Bookmark';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

interface CollectionDetailViewProps {
  collectionId: string;
  collectionName: string;
  onBack: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDefault?: boolean;
  onCollectionUpdateRequest?: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDeleteRequest?: (collectionId: string) => Promise<boolean>;
}

type BookmarkWithMeta = Bookmark & {
  verseKey: string;
  juzNumber: number | null;
  createdAtMs: number | null;
};

const PAGE_SIZE = 10;
const EMPTY_BOOKMARKS: Bookmark[] = [];

const toggleInSet = (set: Set<string>, value: string) => {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
};

const compareVerseKeyAsc = (a: BookmarkWithMeta, b: BookmarkWithMeta) =>
  sortByVerseKey(a.verseKey, b.verseKey);

const compareVerseKeyDesc = (a: BookmarkWithMeta, b: BookmarkWithMeta) =>
  sortByVerseKey(b.verseKey, a.verseKey);

const compareDate = (dir: 'asc' | 'desc') => (a: BookmarkWithMeta, b: BookmarkWithMeta) => {
  const fallback = dir === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  const aVal = a.createdAtMs ?? fallback;
  const bVal = b.createdAtMs ?? fallback;
  if (aVal !== bVal) return dir === 'asc' ? aVal - bVal : bVal - aVal;
  return compareVerseKeyAsc(a, b);
};

const sortBookmarks = (bookmarks: BookmarkWithMeta[], sortBy: CollectionDetailSortOption) => {
  const list = [...bookmarks];

  switch (sortBy) {
    case CollectionDetailSortOption.DateAsc:
      list.sort(compareDate('asc'));
      break;
    case CollectionDetailSortOption.DateDesc:
      list.sort(compareDate('desc'));
      break;
    case CollectionDetailSortOption.QuranicOrderAsc:
    case CollectionDetailSortOption.VerseKey:
      list.sort(compareVerseKeyAsc);
      break;
    case CollectionDetailSortOption.QuranicOrderDesc:
      list.sort(compareVerseKeyDesc);
      break;
    case CollectionDetailSortOption.RecentlyAdded:
    default:
      // Fallback to date desc for the My Quran context.
      list.sort(compareDate('desc'));
      break;
  }

  return list;
};

type TranslateFn = (key: string, query?: Record<string, unknown>) => string;

const isArabicOrUrduLang = (lang: string) => lang === 'ar' || lang === 'ur';

const getCollectionItemsLabel = (totalCount: number, lang: string, t: TranslateFn) => {
  const count = toLocalizedNumber(totalCount, lang);
  return totalCount === 1
    ? t('collections.items', { count })
    : t('collections.items_plural', { count });
};

const getVerseKeysAll = (bookmarks: BookmarkWithMeta[]) => bookmarks.map((b) => b.verseKey);

const getVerseKeysSelected = (bookmarks: BookmarkWithMeta[], selectedIds: Set<string>) =>
  bookmarks.filter((b) => selectedIds.has(b.id)).map((b) => b.verseKey);

const makeSortOptions = (t: TranslateFn) => [
  {
    id: CollectionDetailSortOption.DateDesc,
    label: t('collection:date-desc'),
    direction: ArrowDirection.Down,
  },
  {
    id: CollectionDetailSortOption.DateAsc,
    label: t('collection:date-asc'),
    direction: ArrowDirection.Up,
  },
  {
    id: CollectionDetailSortOption.QuranicOrderAsc,
    label: t('collection:quranic-asc'),
    direction: ArrowDirection.Up,
  },
  {
    id: CollectionDetailSortOption.QuranicOrderDesc,
    label: t('collection:quranic-desc'),
    direction: ArrowDirection.Down,
  },
];

const buildChapterItems = (chaptersData: unknown, lang: string) => {
  const isArabicOrUrdu = isArabicOrUrduLang(lang);
  // Ensure stable 1 -> 114 ordering.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Array.from({ length: 114 }, (unusedValue, index) => index + 1)
    .map((chapterId) => {
      const chapter = getChapterData(
        chaptersData as Parameters<typeof getChapterData>[0],
        String(chapterId),
      );
      const surahName = isArabicOrUrdu ? chapter?.nameArabic : chapter?.transliteratedName;
      const localized = toLocalizedNumber(chapterId, lang);
      const numericLabel = `${chapterId}.`;
      const localizedLabel = `${localized}.`;
      return {
        value: String(chapterId),
        label: `${localizedLabel} ${surahName || ''}`.trim(),
        searchText: `${numericLabel} ${surahName || ''} ${chapterId}`.trim().toLowerCase(),
      };
    })
    .filter((item) => item.label);
};

const buildJuzItems = (lang: string, tCommon: TranslateFn) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Array.from({ length: 30 }, (unusedValue, index) => index + 1).map((juzNumber) => {
    const localized = toLocalizedNumber(juzNumber, lang);
    const numericLabel = `${juzNumber}`;
    const localizedLabel = `${localized}`;
    return {
      value: String(juzNumber),
      label: `${tCommon('juz')} ${localizedLabel}`,
      searchText: `${tCommon('juz')} ${numericLabel} ${localizedLabel}`.toLowerCase(),
    };
  });
};

const buildActiveChapterChips = (
  chaptersData: unknown,
  lang: string,
  selectedChapterIds: string[],
): ActiveFilterChip[] => {
  const isArabicOrUrdu = isArabicOrUrduLang(lang);
  return selectedChapterIds
    .map((chapterIdStr) => {
      const chapter = getChapterData(
        chaptersData as Parameters<typeof getChapterData>[0],
        chapterIdStr,
      );
      const surahName = isArabicOrUrdu ? chapter?.nameArabic : chapter?.transliteratedName;
      const localized = toLocalizedNumber(Number(chapterIdStr), lang);
      return { id: chapterIdStr, label: `${localized}. ${surahName || ''}`.trim() };
    })
    .filter((chip) => chip.label);
};

const buildActiveJuzChips = (lang: string, selectedJuzNumbers: string[], tCommon: TranslateFn) => {
  return selectedJuzNumbers.map((juzNumberStr) => {
    const localized = toLocalizedNumber(Number(juzNumberStr), lang);
    return { id: juzNumberStr, label: `${tCommon('juz')} ${localized}` };
  });
};

const CollectionDetailView: React.FC<CollectionDetailViewProps> = ({
  collectionId,
  collectionName,
  onBack,
  searchQuery,
  onSearchChange,
  isDefault,
  onCollectionUpdateRequest,
  onCollectionDeleteRequest,
}) => {
  const numericCollectionId = slugifiedCollectionIdToCollectionId(collectionId);
  const { t, lang } = useTranslation('my-quran');
  const { t: tCommon } = useTranslation('common');
  const dispatch = useDispatch();
  const [sortBy, setSortBy] = useState(CollectionDetailSortOption.DateDesc);
  const toast = useToast();
  const { invalidateAllBookmarkCaches } = useBookmarkCacheInvalidator();
  const { isLoggedIn } = useIsLoggedIn();
  const { mutate: globalMutate } = useSWRConfig();
  const { quranFont, mushafLines } = useSelector(selectQuranReaderStyles, shallowEqual);
  const { mushaf: mushafId } = getMushafId(quranFont, mushafLines);
  const chaptersData = useContext(DataContext);

  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedBookmarks, setSelectedBookmarks] = useState<Set<string>>(new Set());
  const [expandedCardIds, setExpandedCardIds] = useState<Set<string>>(new Set());

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(false);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [selectedJuzNumbers, setSelectedJuzNumbers] = useState<string[]>([]);
  const hasActiveFilters = selectedChapterIds.length > 0 || selectedJuzNumbers.length > 0;

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteModalVerseKeys, setNoteModalVerseKeys] = useState<string[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetListState = useCallback(() => {
    setVisibleCount(PAGE_SIZE);
    setExpandedCardIds(new Set());
    setSelectedBookmarks(new Set());
    setIsSelectMode(false);
  }, []);

  // Fetch all bookmarks at once
  // We keep the server-side sort stable and do client-side sorting for My Quran.
  const fetchUrl = makeGetBookmarkByCollectionId(collectionId, {
    sortBy: CollectionDetailSortOption.RecentlyAdded,
    type: BookmarkType.Ayah,
    limit: 10000,
  });

  const { data, mutate, error } = useSWR<GetBookmarkCollectionsIdResponse>(
    fetchUrl,
    privateFetcher,
  );

  const bookmarks: Bookmark[] = data?.data?.bookmarks ?? EMPTY_BOOKMARKS;

  const bookmarksWithMeta: BookmarkWithMeta[] = useMemo(() => {
    return bookmarks.map((bookmark) => {
      const verseNumber = bookmark.verseNumber ?? 1;
      const verseKey = makeVerseKey(bookmark.key, verseNumber);
      const juzNumber = getJuzNumberByVerse(bookmark.key, verseNumber);
      const parsedCreatedAtMs = bookmark.createdAt ? Date.parse(bookmark.createdAt) : NaN;
      const createdAtMs = Number.isFinite(parsedCreatedAtMs) ? parsedCreatedAtMs : null;
      return { ...bookmark, verseKey, juzNumber, createdAtMs };
    });
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const hasChapterFilters = selectedChapterIds.length > 0;
    const hasJuzFilters = selectedJuzNumbers.length > 0;
    const shouldFilter = hasChapterFilters || hasJuzFilters;

    const chapterIdSet = hasChapterFilters ? new Set(selectedChapterIds) : null;
    const juzSet = hasJuzFilters ? new Set(selectedJuzNumbers) : null;

    const query = searchQuery.trim().toLowerCase();

    return bookmarksWithMeta.filter((bookmark) => {
      if (query && !bookmark.verseKey.includes(query)) return false;
      if (!shouldFilter) return true;

      const matchesChapter = chapterIdSet ? chapterIdSet.has(String(bookmark.key)) : true;
      const matchesJuz = juzSet ? juzSet.has(String(bookmark.juzNumber ?? '')) : true;

      // When both filters are active, require both matches (AND) so adding a filter always narrows results.
      return matchesChapter && matchesJuz;
    });
  }, [bookmarksWithMeta, searchQuery, selectedChapterIds, selectedJuzNumbers]);

  const sortedBookmarks: BookmarkWithMeta[] = useMemo(
    () => sortBookmarks(filteredBookmarks, sortBy),
    [filteredBookmarks, sortBy],
  );

  const displayedBookmarks = useMemo(
    () => sortedBookmarks.slice(0, visibleCount),
    [sortedBookmarks, visibleCount],
  );

  const hasMore = displayedBookmarks.length < sortedBookmarks.length;
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sortedBookmarks.length));
  }, [sortedBookmarks.length]);

  const isAllExpanded = useMemo(() => {
    if (displayedBookmarks.length === 0) return false;
    return displayedBookmarks.every((b) => expandedCardIds.has(b.id));
  }, [displayedBookmarks, expandedCardIds]);

  const onSortByChange = useCallback(
    (newSortByVal: CollectionDetailSortOption) => {
      logValueChange('collection_detail_page_sort_by', sortBy, newSortByVal);
      setSortBy(newSortByVal);
      resetListState();
    },
    [sortBy, resetListState],
  );

  const toggleSelectMode = useCallback(() => {
    setIsSelectMode((prev) => {
      if (prev) setSelectedBookmarks(new Set());
      return !prev;
    });
    logButtonClick('collection_detail_toggle_select_mode', {
      collectionId: numericCollectionId,
      isEntering: !isSelectMode,
    });
  }, [numericCollectionId, isSelectMode]);

  const handleToggleExpandCollapseAll = useCallback(() => {
    const params = { collectionId: numericCollectionId };

    if (isAllExpanded) {
      setExpandedCardIds((prev) => {
        const next = new Set(prev);
        displayedBookmarks.forEach((b) => next.delete(b.id));
        return next;
      });
      logButtonClick('collection_detail_collapse_all', params);
    } else {
      setExpandedCardIds((prev) => {
        const next = new Set(prev);
        displayedBookmarks.forEach((b) => next.add(b.id));
        return next;
      });
      logButtonClick('collection_detail_expand_all', params);
    }
  }, [displayedBookmarks, isAllExpanded, numericCollectionId]);

  const handleToggleBookmarkSelection = useCallback((bookmarkId: string) => {
    setSelectedBookmarks((prev) => toggleInSet(prev, bookmarkId));
  }, []);

  const handleToggleCardExpansion = useCallback((bookmarkId: string) => {
    setExpandedCardIds((prev) => toggleInSet(prev, bookmarkId));
  }, []);

  const isCardExpanded = useCallback(
    (bookmarkId: string) => expandedCardIds.has(bookmarkId),
    [expandedCardIds],
  );

  const isBookmarkSelected = useCallback(
    (bookmarkId: string) => selectedBookmarks.has(bookmarkId),
    [selectedBookmarks],
  );

  const handleNoteClick = useCallback(() => {
    const verseKeys = getVerseKeysAll(sortedBookmarks);

    setNoteModalVerseKeys(verseKeys);
    setIsNoteModalOpen(true);

    logButtonClick('collection_detail_note_click', {
      collectionId: numericCollectionId,
      selectedCount: selectedBookmarks.size,
      isBulkAction: false,
    });
  }, [numericCollectionId, sortedBookmarks, selectedBookmarks.size]);

  const handleBulkNoteClick = useCallback(() => {
    const verseKeys = getVerseKeysSelected(sortedBookmarks, selectedBookmarks);

    setNoteModalVerseKeys(verseKeys);
    setIsNoteModalOpen(true);

    logButtonClick('collection_detail_bulk_note_click', {
      collectionId: numericCollectionId,
      selectedCount: selectedBookmarks.size,
    });
  }, [numericCollectionId, sortedBookmarks, selectedBookmarks]);

  const handleNoteModalClose = useCallback(() => {
    setIsNoteModalOpen(false);
    setNoteModalVerseKeys([]);
  }, []);

  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
    logButtonClick('collection_detail_edit_click', {
      collectionId: numericCollectionId,
    });
  }, [numericCollectionId]);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleEditSubmit = useCallback(
    async (formData: { name: string }) => {
      // Optimistic: close modal immediately
      setIsEditModalOpen(false);

      // Parent's update handler has optimistic updates built-in
      const success = await onCollectionUpdateRequest?.(numericCollectionId, formData.name);
      if (success) {
        toast(t('collection:edit-collection-success'), { status: ToastStatus.Success });
        logButtonClick('collection_edit_success', { collectionId: numericCollectionId });
      } else {
        toast(t('common:error.general'), { status: ToastStatus.Error });
        logButtonClick('collection_edit_failed', { collectionId: numericCollectionId });
      }
    },
    [numericCollectionId, toast, t, onCollectionUpdateRequest],
  );

  const handleDeleteClick = useCallback(() => {
    logButtonClick('collection_detail_delete_click', {
      collectionId: numericCollectionId,
    });
    setIsDeleteModalOpen(true);
  }, [numericCollectionId]);

  const handleDeleteModalClose = useCallback(() => {
    setIsDeleteModalOpen(false);
    logButtonClick('collection_delete_cancel', {
      collectionId: numericCollectionId,
    });
  }, [numericCollectionId]);

  const handleDeleteConfirm = useCallback(async () => {
    logButtonClick('collection_delete_confirm', { collectionId: numericCollectionId });
    setIsDeleting(true);

    if (!onCollectionDeleteRequest) {
      setIsDeleting(false);
      return;
    }

    const success = await onCollectionDeleteRequest(numericCollectionId);
    setIsDeleting(false);
    if (success) {
      setIsDeleteModalOpen(false);
      toast(t('collection:delete-collection-success'), { status: ToastStatus.Success });
      invalidateAllBookmarkCaches();
    } else {
      toast(t('common:error.general'), { status: ToastStatus.Error });
    }
  }, [numericCollectionId, onCollectionDeleteRequest, toast, t, invalidateAllBookmarkCaches]);

  const pinVersesAndSync = useCallback(
    async (verseKeys: string[]) => {
      dispatch(pinVerses(verseKeys));
      verseKeys.forEach((vk) => {
        broadcastPinnedVerses(PinnedVersesBroadcastType.PIN, { verseKey: vk });
      });

      if (isLoggedIn) {
        try {
          const syncPayload = verseKeys.map((vk) => buildPinnedSyncPayload(vk, mushafId));
          await syncPinnedItems(syncPayload);
          globalMutate(isPinnedItemsCacheKey, undefined, { revalidate: true });
        } catch (syncError) {
          logErrorToSentry(syncError, { transactionName: 'collectionDetail.pinVerses' });
          toast(t('common:error.general'), {
            status: ToastStatus.Error,
            actions: [{ text: t('common:retry'), onClick: () => pinVersesAndSync(verseKeys) }],
          });
          return;
        }
      }

      toast(t('quran-reader:verses-pinned', { count: verseKeys.length }), {
        status: ToastStatus.Success,
      });
    },
    [dispatch, isLoggedIn, mushafId, globalMutate, toast, t],
  );

  const handlePinAllVerses = useCallback(() => {
    const verseKeys = getVerseKeysAll(sortedBookmarks);
    logButtonClick('collection_detail_pin_all_verses', {
      collectionId: numericCollectionId,
      count: verseKeys.length,
    });
    pinVersesAndSync(verseKeys);
  }, [sortedBookmarks, numericCollectionId, pinVersesAndSync]);

  const handlePinSelectedVerses = useCallback(() => {
    const verseKeys = getVerseKeysSelected(sortedBookmarks, selectedBookmarks);
    logButtonClick('collection_detail_pin_selected_verses', {
      collectionId: numericCollectionId,
      count: verseKeys.length,
    });
    pinVersesAndSync(verseKeys);
  }, [sortedBookmarks, selectedBookmarks, numericCollectionId, pinVersesAndSync]);

  const chapterItems = useMemo(() => {
    return buildChapterItems(chaptersData, lang);
  }, [chaptersData, lang]);

  const juzItems = useMemo(() => {
    return buildJuzItems(lang, tCommon);
  }, [lang, tCommon]);

  const activeChapterChips: ActiveFilterChip[] = useMemo(() => {
    return buildActiveChapterChips(chaptersData, lang, selectedChapterIds);
  }, [chaptersData, lang, selectedChapterIds]);

  const activeJuzChips: ActiveFilterChip[] = useMemo(() => {
    return buildActiveJuzChips(lang, selectedJuzNumbers, tCommon);
  }, [lang, selectedJuzNumbers, tCommon]);

  const onRemoveChapterFilter = useCallback(
    (chapterId: string) => {
      setSelectedChapterIds((prev) => prev.filter((id) => id !== chapterId));
      resetListState();
    },
    [resetListState],
  );

  const onRemoveJuzFilter = useCallback(
    (juzNumber: string) => {
      setSelectedJuzNumbers((prev) => prev.filter((id) => id !== juzNumber));
      resetListState();
    },
    [resetListState],
  );

  const onClearAllFilters = useCallback(() => {
    setSelectedChapterIds([]);
    setSelectedJuzNumbers([]);
    // Search is currently not exposed in the UI. Clearing all active constraints should also clear
    // any externally-supplied query (e.g. via URL/state) to avoid trapping the user in a filtered view.
    onSearchChange('');
    resetListState();
  }, [onSearchChange, resetListState]);

  const onSelectedChapterIdsChange = useCallback(
    (ids: string[]) => {
      setSelectedChapterIds(ids);
      resetListState();
    },
    [resetListState],
  );

  const onSelectedJuzNumbersChange = useCallback(
    (nums: string[]) => {
      setSelectedJuzNumbers(nums);
      resetListState();
    },
    [resetListState],
  );

  // Prevent Virtuoso's `endReached` from triggering additional pages before the user scrolls.
  const [hasUserInteractedWithScroll, setHasUserInteractedWithScroll] = useState(false);
  useEffect(() => {
    const handler = () => setHasUserInteractedWithScroll(true);
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('wheel', handler, { passive: true });
    window.addEventListener('touchmove', handler, { passive: true });
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('wheel', handler);
      window.removeEventListener('touchmove', handler);
    };
  }, []);

  const onUpdated = useCallback(() => {
    mutate();
    invalidateAllBookmarkCaches();
  }, [invalidateAllBookmarkCaches, mutate]);

  const onItemDeleted = useCallback(
    (bookmarkId: string) => {
      deleteCollectionBookmarkById(collectionId, bookmarkId)
        .then(() => onUpdated())
        .catch(() => {
          toast(t('common:error.general'), { status: ToastStatus.Error });
        });
    },
    [collectionId, onUpdated, toast, t],
  );

  if (error) {
    return (
      <div className={styles.statusContainer}>
        <Error onRetryClicked={() => mutate()} error={error} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.statusContainer}>
        <Spinner size={SpinnerSize.Large} />
      </div>
    );
  }

  const isOwner = data?.data?.isOwner ?? false;
  const totalCount = sortedBookmarks.length;

  const sortOptions = makeSortOptions(t);

  return (
    <div className={styles.container}>
      <div className={styles.searchAndActions}>
        <div className={styles.searchSpacer} aria-hidden="true" />

        <div className={styles.topActions}>
          <CollectionFiltersDropdown
            isOpen={isFiltersDropdownOpen}
            onOpenChange={setIsFiltersDropdownOpen}
            trigger={
              <button type="button" className={styles.filterButton} aria-label={t('search.filter')}>
                <FilterIcon className={styles.filterIcon} />
                <span className={styles.filterText}>{t('search.filter')}</span>
                {hasActiveFilters && <span className={styles.activeDot} />}
              </button>
            }
            chapterItems={chapterItems}
            juzItems={juzItems}
            selectedChapterIds={selectedChapterIds}
            selectedJuzNumbers={selectedJuzNumbers}
            onSelectedChapterIdsChange={onSelectedChapterIdsChange}
            onSelectedJuzNumbersChange={onSelectedJuzNumbersChange}
          />

          <CollectionSorter
            selectedOptionId={sortBy}
            onChange={onSortByChange}
            options={sortOptions}
            isSingleCollection
            collectionId={numericCollectionId}
          />
        </div>
      </div>

      <ActiveFiltersChips
        chapters={activeChapterChips}
        juz={activeJuzChips}
        onRemoveChapter={onRemoveChapterFilter}
        onRemoveJuz={onRemoveJuzFilter}
        onClearAll={onClearAllFilters}
      />

      <div className={styles.header}>
        <Button onClick={onBack} variant={ButtonVariant.Ghost} className={styles.backButton}>
          <ChevronLeft />
          <span>{collectionName}</span>
        </Button>
        <div className={styles.badgeContainer}>
          <span className={styles.badge}>{getCollectionItemsLabel(totalCount, lang, t)}</span>
          <CollectionHeaderActionsPopover
            onNoteClick={handleNoteClick}
            onPinVersesClick={handlePinAllVerses}
            onEditClick={isDefault ? undefined : handleEditClick}
            onDeleteClick={isDefault ? undefined : handleDeleteClick}
            dataTestPrefix="collection-header-actions"
          >
            <button type="button" className={styles.iconButton} aria-label={t('common:more')}>
              <MenuMoreHorizIcon />
            </button>
          </CollectionHeaderActionsPopover>
        </div>
      </div>

      <div className={styles.bulkActionsContainer}>
        <Button
          variant={ButtonVariant.Ghost}
          size={ButtonSize.XSmall}
          className={styles.bulkActionButton}
          onClick={handleToggleExpandCollapseAll}
        >
          {isAllExpanded ? t('bulk-actions.collapse-all') : t('bulk-actions.expand-all')}
        </Button>

        {isSelectMode ? (
          <div className={styles.selectModeActions}>
            <Button
              variant={ButtonVariant.Ghost}
              size={ButtonSize.XSmall}
              className={styles.bulkActionButton}
              onClick={toggleSelectMode}
            >
              {t('bulk-actions.cancel')}
            </Button>
            {selectedBookmarks.size > 0 ? (
              <CollectionBulkActionsPopover
                onNoteClick={handleBulkNoteClick}
                onPinVersesClick={handlePinSelectedVerses}
                dataTestPrefix="collection-bulk-actions"
              >
                <Button
                  variant={ButtonVariant.Ghost}
                  size={ButtonSize.XSmall}
                  className={styles.bulkActionButton}
                >
                  {t('bulk-actions.actions-count', {
                    count: toLocalizedNumber(selectedBookmarks.size, lang),
                  })}
                </Button>
              </CollectionBulkActionsPopover>
            ) : (
              <Button
                variant={ButtonVariant.Ghost}
                size={ButtonSize.XSmall}
                className={styles.bulkActionButton}
                isDisabled
              >
                {t('bulk-actions.actions')}
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant={ButtonVariant.Ghost}
            className={styles.bulkActionButton}
            size={ButtonSize.XSmall}
            onClick={toggleSelectMode}
          >
            {t('bulk-actions.select')}
          </Button>
        )}
      </div>

      <div className={styles.separator} />

      <CollectionDetail
        id={numericCollectionId}
        title={collectionName}
        bookmarks={displayedBookmarks}
        emptyMessage={
          (data?.data?.bookmarks?.length ?? 0) === 0
            ? t('collections.detail-empty')
            : t('collections.filters.no-matches')
        }
        onItemDeleted={onItemDeleted}
        isOwner={isOwner}
        onBack={onBack}
        isSelectMode={isSelectMode}
        shouldUseBodyScroll
        onEndReached={hasUserInteractedWithScroll && hasMore ? loadMore : undefined}
        hasMore={hasMore}
        isVirtualizeForced={sortedBookmarks.length > 12}
        onToggleBookmarkSelection={handleToggleBookmarkSelection}
        onToggleCardExpansion={handleToggleCardExpansion}
        isCardExpanded={isCardExpanded}
        isBookmarkSelected={isBookmarkSelected}
      />

      <StudyModeContainer />
      <VerseActionModalContainer />

      <AddNoteModal
        showRanges
        isModalOpen={isNoteModalOpen}
        onModalClose={handleNoteModalClose}
        onMyNotes={handleNoteModalClose}
        verseKeys={noteModalVerseKeys}
      />

      <EditCollectionModal
        isOpen={isEditModalOpen}
        defaultValue={collectionName}
        onSubmit={handleEditSubmit}
        onClose={handleEditModalClose}
      />

      <DeleteCollectionModal
        isOpen={isDeleteModalOpen}
        collectionName={collectionName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteModalClose}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CollectionDetailView;
