/* eslint-disable max-lines */
import { useCallback, useMemo, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import useCollectionBulkActions from './useCollectionBulkActions';
import useCollectionDetailData from './useCollectionDetailData';
import useCollectionDetailViewDeps from './useCollectionDetailViewDeps';
import useCollectionEditDelete from './useCollectionEditDelete';
import useCollectionNotes from './useCollectionNotes';
import useCollectionPinnedVerses from './useCollectionPinnedVerses';
import useCollectionSelection from './useCollectionSelection';

import type { ActiveFilterChip } from '@/components/MyQuran/SavedTabContent/ActiveFiltersChips';
import type { CollectionFiltersDropdownProps } from '@/components/MyQuran/SavedTabContent/CollectionFiltersDropdown';
import { ToastStatus } from '@/dls/Toast/Toast';
import { deleteCollectionBookmarkById } from '@/utils/auth/api';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber } from '@/utils/locale';

const SINGLE_ITEM_COUNT = 1;
const QURAN_CHAPTERS_COUNT = 114;
const QURAN_JUZ_COUNT = 30;

interface UseCollectionDetailViewControllerParams {
  collectionId: string;
  collectionName: string;
  searchQuery?: string;
  onSearchChange: (query: string) => void;
  isDefault?: boolean;
  onCollectionUpdateRequest?: (collectionId: string, newName: string) => Promise<boolean>;
  onCollectionDeleteRequest?: (collectionId: string) => Promise<boolean>;
}

const isArabicOrUrduLang = (lang: string) => lang === 'ar' || lang === 'ur';

const buildChapterItems = (
  chaptersData: unknown,
  lang: string,
): CollectionFiltersDropdownProps['chapterItems'] => {
  const isArabicOrUrdu = isArabicOrUrduLang(lang);

  // Ensure stable 1 -> 114 ordering.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Array.from({ length: QURAN_CHAPTERS_COUNT }, (unusedValue, index) => index + 1)
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

const buildJuzItems = (
  lang: string,
  tCommon: (key: string, query?: Record<string, unknown>) => string,
): CollectionFiltersDropdownProps['juzItems'] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Array.from({ length: QURAN_JUZ_COUNT }, (unusedValue, index) => index + 1).map(
    (juzNumber) => {
      const localized = toLocalizedNumber(juzNumber, lang);
      const numericLabel = `${juzNumber}`;
      const localizedLabel = `${localized}`;
      return {
        value: String(juzNumber),
        label: `${tCommon('juz')} ${localizedLabel}`,
        searchText: `${tCommon('juz')} ${numericLabel} ${localizedLabel}`.toLowerCase(),
      };
    },
  );
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

const buildActiveJuzChips = (
  lang: string,
  selectedJuzNumbers: string[],
  tCommon: (key: string, query?: Record<string, unknown>) => string,
): ActiveFilterChip[] => {
  return selectedJuzNumbers.map((juzNumberStr) => {
    const localized = toLocalizedNumber(Number(juzNumberStr), lang);
    return { id: juzNumberStr, label: `${tCommon('juz')} ${localized}` };
  });
};

const useCollectionDetailViewController = ({
  collectionId,
  collectionName,
  searchQuery,
  onSearchChange,
  isDefault,
  onCollectionUpdateRequest,
  onCollectionDeleteRequest,
}: UseCollectionDetailViewControllerParams) => {
  const {
    t,
    lang,
    toast,
    chaptersData,
    invalidateAllBookmarkCaches,
    isLoggedIn,
    globalMutate,
    dispatch,
    mushafId,
    selectedTranslations,
  } = useCollectionDetailViewDeps();

  const { t: tCommon } = useTranslation('common');

  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [selectedJuzNumbers, setSelectedJuzNumbers] = useState<string[]>([]);
  const hasActiveFilters = selectedChapterIds.length > 0 || selectedJuzNumbers.length > 0;

  const dataState = useCollectionDetailData({
    collectionId,
    searchQuery,
    selectedChapterIds,
    selectedJuzNumbers,
    invalidateAllBookmarkCaches,
  });
  const selection = useCollectionSelection({
    filteredBookmarks: dataState.filteredBookmarks,
    numericCollectionId: dataState.numericCollectionId,
  });
  const { resetSelectionState } = selection;
  const notes = useCollectionNotes({
    filteredBookmarks: dataState.filteredBookmarks,
    selectedBookmarks: selection.selectedBookmarks,
    numericCollectionId: dataState.numericCollectionId,
  });
  const editDelete = useCollectionEditDelete({
    numericCollectionId: dataState.numericCollectionId,
    t,
    toast,
    invalidateAllBookmarkCaches,
    onCollectionUpdateRequest,
    onCollectionDeleteRequest,
  });
  const pinnedVerses = useCollectionPinnedVerses({
    dispatch,
    globalMutate,
    isLoggedIn,
    mushafId,
    toast,
    t,
    numericCollectionId: dataState.numericCollectionId,
    filteredBookmarks: dataState.filteredBookmarks,
    selectedBookmarks: selection.selectedBookmarks,
  });
  const bulkActions = useCollectionBulkActions({
    chaptersData,
    lang,
    t,
    toast,
    numericCollectionId: dataState.numericCollectionId,
    filteredBookmarks: dataState.filteredBookmarks,
    selectedBookmarks: selection.selectedBookmarks,
    selectedTranslations,
    onUpdated: dataState.onUpdated,
    removeBookmarkIdsFromState: selection.removeBookmarkIdsFromState,
  });
  const { numericCollectionId, onUpdated } = dataState;

  const chapterItems = useMemo(() => buildChapterItems(chaptersData, lang), [chaptersData, lang]);

  const juzItems = useMemo(() => buildJuzItems(lang, tCommon), [lang, tCommon]);

  const activeChapterChips: ActiveFilterChip[] = useMemo(
    () => buildActiveChapterChips(chaptersData, lang, selectedChapterIds),
    [chaptersData, lang, selectedChapterIds],
  );

  const activeJuzChips: ActiveFilterChip[] = useMemo(
    () => buildActiveJuzChips(lang, selectedJuzNumbers, tCommon),
    [lang, selectedJuzNumbers, tCommon],
  );

  const onSelectedChapterIdsChange = useCallback(
    (ids: string[]) => {
      setSelectedChapterIds(ids);
      resetSelectionState();
    },
    [resetSelectionState],
  );

  const onSelectedJuzNumbersChange = useCallback(
    (nums: string[]) => {
      setSelectedJuzNumbers(nums);
      resetSelectionState();
    },
    [resetSelectionState],
  );

  const onRemoveChapterFilter = useCallback(
    (chapterId: string) => {
      setSelectedChapterIds((prev) => prev.filter((id) => id !== chapterId));
      resetSelectionState();
    },
    [resetSelectionState],
  );

  const onRemoveJuzFilter = useCallback(
    (juzNumber: string) => {
      setSelectedJuzNumbers((prev) => prev.filter((id) => id !== juzNumber));
      resetSelectionState();
    },
    [resetSelectionState],
  );

  const onClearAllFilters = useCallback(() => {
    setSelectedChapterIds([]);
    setSelectedJuzNumbers([]);
    // Clearing all active constraints should also clear any externally-supplied query.
    onSearchChange('');
    resetSelectionState();
  }, [onSearchChange, resetSelectionState]);

  const onItemDeleted = useCallback(
    (bookmarkId: string) => {
      deleteCollectionBookmarkById(numericCollectionId, bookmarkId)
        .then(() => {
          onUpdated();
          toast(
            t('collection:delete-bookmark.success', {
              count: toLocalizedNumber(SINGLE_ITEM_COUNT, lang),
            }),
            { status: ToastStatus.Success },
          );
        })
        .catch(() => {
          toast(t('common:error.general'), { status: ToastStatus.Error });
        });
    },
    [lang, numericCollectionId, onUpdated, t, toast],
  );

  const isOwner = dataState.data?.data?.isOwner ?? false;
  const bookmarksCount = useMemo(
    () => dataState.data?.data?.bookmarks.length ?? 0,
    [dataState.data],
  );
  const totalCount = useMemo(
    () => dataState.filteredBookmarks.length ?? 0,
    [dataState.filteredBookmarks],
  );

  const emptyMessage = useMemo(() => {
    return bookmarksCount === 0
      ? t('collections.detail-empty')
      : t('collections.filters.no-matches');
  }, [bookmarksCount, t]);

  return {
    t,
    lang,
    toast,
    chaptersData,
    invalidateAllBookmarkCaches,
    isLoggedIn,
    globalMutate,
    dispatch,
    mushafId,
    selectedTranslations,
    ...dataState,
    ...selection,
    ...notes,
    ...editDelete,
    ...pinnedVerses,
    ...bulkActions,
    collectionName,
    isDefault,
    isOwner,
    totalCount,
    emptyMessage,
    onItemDeleted,
    chapterItems,
    juzItems,
    selectedChapterIds,
    selectedJuzNumbers,
    onSelectedChapterIdsChange,
    onSelectedJuzNumbersChange,
    activeChapterChips,
    activeJuzChips,
    hasActiveFilters,
    onRemoveChapterFilter,
    onRemoveJuzFilter,
    onClearAllFilters,
  };
};

export default useCollectionDetailViewController;
