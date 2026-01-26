/* eslint-disable max-lines */
import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import { CollectionItem } from './Collections/CollectionsListItem';
import { useCollectionsState } from './Collections/hooks/useCollectionsState';
import { useCollectionToggle } from './Collections/hooks/useCollectionToggle';
import { useSaveBookmarkData } from './useSaveBookmarkData';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import Bookmark, { ReadingBookmarkType } from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import Verse from '@/types/Verse';
import { getMushafId } from '@/utils/api';
import { addCollection, addCollectionBookmark } from '@/utils/auth/api';
import { getErrorStatus } from '@/utils/auth/errors';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';
import { getChapterWithStartingVerseUrl, getPageNavigationUrl } from '@/utils/navigation';

interface UseSaveBookmarkModalOptions {
  type: ReadingBookmarkType;
  verse?: Verse;
  pageNumber?: number;
  onClose: () => void;
}

interface UseSaveBookmarkModalReturn {
  // State
  isTogglingFavorites: boolean;
  isCreatingCollection: boolean;
  newCollectionName: string;
  isSubmittingCollection: boolean;
  sortedCollections: CollectionItem[];
  isDataReady: boolean;
  userIsLoggedIn: boolean;
  mushafId: number;

  // Derived values
  isVerse: boolean;
  isPage: boolean;
  verseKey: string;
  modalTitle: string;
  resourceBookmark: Bookmark | null | undefined;
  readingBookmarkData?: Bookmark | null;
  mutateReadingBookmark?: (
    data?: Bookmark | null | Promise<Bookmark | null>,
    opts?: { revalidate?: boolean },
  ) => Promise<Bookmark | null | undefined>;

  // Handlers
  setNewCollectionName: (name: string) => void;
  handleReadingBookmarkChanged: () => Promise<void>;
  handleFavoritesToggle: () => Promise<void>;
  handleCollectionToggle: (collection: CollectionItem, checked: boolean) => Promise<void>;
  handleNewCollectionClick: () => void;
  handleBackFromNewCollection: () => void;
  handleCancelNewCollection: () => void;
  handleCreateCollection: () => Promise<void>;
  handleTakeNote: () => void;
  handleGuestSignIn: () => void;
}

/**
 * Custom hook to manage SaveBookmarkModal state and operations.
 * Extracts all business logic from the modal component.
 * Handles both logged-in users and guest users.
 *
 * @param {UseSaveBookmarkModalOptions} options - Options for managing save bookmark modal
 * @returns {UseSaveBookmarkModalReturn} The save bookmark modal state and handlers
 */
const useSaveBookmarkModal = ({
  type,
  verse,
  pageNumber,
  onClose,
}: UseSaveBookmarkModalOptions): UseSaveBookmarkModalReturn => {
  const { t, lang } = useTranslation('quran-reader');
  const commonT = useTranslation('common').t;
  const toast = useToast();
  const router = useRouter();

  const isVerse = type === ReadingBookmarkType.AYAH;
  const isPage = type === ReadingBookmarkType.PAGE;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  // State
  const [isTogglingFavorites, setIsTogglingFavorites] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isSubmittingCollection, setIsSubmittingCollection] = useState(false);

  // Data hooks
  const bookmarkData = useSaveBookmarkData({
    isVerse,
    isPage,
    verse,
    pageNumber,
    mushafId,
    quranReaderStyles,
  });

  const { sortedCollections } = useCollectionsState({
    isVerse,
    collectionListData: bookmarkData.collectionListData,
    bookmarkCollectionIdsData: bookmarkData.bookmarkCollectionIdsData,
  });

  // Handler hooks
  const verseKey = verse ? `${verse.chapterId}:${verse.verseNumber}` : '';

  // Collection toggle is only for verses (collection bookmarks not supported for pages)
  // Note: onMutate is intentionally not passed - we use optimistic updates without refetching
  const { handleToggleCollection, handleToggleFavorites } = useCollectionToggle({
    verse,
    mushafId,
    bookmarkCollectionIdsData: bookmarkData.bookmarkCollectionIdsData,
    verseKey,
    mutateResourceBookmark: bookmarkData.mutateResourceBookmark,
    mutateBookmarkCollectionIdsData: bookmarkData.mutateBookmarkCollectionIdsData,
  });

  // Localization
  const localizedVerseKey = verse ? toLocalizedVerseKey(verseKey, lang) : '';
  const localizedPageNumber = pageNumber ? toLocalizedNumber(pageNumber, lang) : '';

  const modalTitle = isVerse
    ? t('save-verse', { verseKey: localizedVerseKey })
    : t('save-page', { pageNumber: localizedPageNumber });

  // Handlers
  const handleReadingBookmarkChanged = useCallback(async (): Promise<void> => {
    await bookmarkData.mutateAllData();
  }, [bookmarkData]);

  const handleFavoritesToggle = useCallback(async (): Promise<void> => {
    setIsTogglingFavorites(true);
    try {
      // Get the current favorites state from sortedCollections
      const favoritesCollection = sortedCollections.find((c) => c.isDefault);
      const isCurrentlyInFavorites = favoritesCollection?.checked ?? false;
      // Pass the opposite (new state after toggle)
      await handleToggleFavorites(!isCurrentlyInFavorites);
    } catch (error) {
      const status = getErrorStatus(error);
      const errorMessage =
        status === 400 ? commonT('error.bookmark-sync') : commonT('error.general');
      toast(errorMessage, { status: ToastStatus.Error });
    } finally {
      setIsTogglingFavorites(false);
    }
  }, [handleToggleFavorites, sortedCollections, commonT, toast]);

  const handleCollectionToggle = useCallback(
    async (collection: CollectionItem, checked: boolean): Promise<void> => {
      if (collection.isDefault) {
        await handleFavoritesToggle();
        return;
      }

      // For regular collections, use the unified handler
      // The 'checked' parameter is the NEW state (after toggle), so we need to pass the CURRENT state
      // If checked is true (will be in collection), then currently it's NOT in collection
      // If checked is false (will not be in collection), then currently it IS in collection
      await handleToggleCollection(collection.id, collection.name, !checked);
    },
    [handleFavoritesToggle, handleToggleCollection],
  );

  const handleNewCollectionClick = useCallback((): void => {
    logButtonClick('save_bookmark_modal_new_collection');
    setIsCreatingCollection(true);
    setNewCollectionName('');
  }, []);

  const handleBackFromNewCollection = useCallback((): void => {
    setIsCreatingCollection(false);
    setNewCollectionName('');
  }, []);

  const handleCancelNewCollection = useCallback((): void => {
    setIsCreatingCollection(false);
    setNewCollectionName('');
  }, []);

  // eslint-disable-next-line react-func/max-lines-per-function
  const handleCreateCollection = useCallback(async (): Promise<void> => {
    if (!newCollectionName.trim() || !verse) return;
    setIsSubmittingCollection(true);

    const trimmedName = newCollectionName.trim();

    // Optimistic update: Add temporary collection to the list immediately
    const tempId = `temp-${Date.now()}`;
    const tempCollection = {
      id: tempId,
      name: trimmedName,
      url: trimmedName.toLowerCase().replace(/\s+/g, '-'),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically update collection list
    const currentCollections = bookmarkData.collectionListData?.data || [];
    bookmarkData.mutateCollectionListData(
      { ...bookmarkData.collectionListData, data: [...currentCollections, tempCollection] },
      { revalidate: false },
    );

    try {
      const newCollection = await addCollection(trimmedName);
      await addCollectionBookmark({
        key: Number(verse.chapterId),
        mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
        collectionId: newCollection?.id,
        bookmarkId: bookmarkData.resourceBookmark?.id,
      });
      toast(t('saved-to', { collectionName: trimmedName }), {
        status: ToastStatus.Success,
      });
      logEvent('collection_created_and_ayah_added', {
        verseKey,
        collectionName: trimmedName,
      });

      // Revalidate to replace temp collection with real one
      bookmarkData.mutateAllData();
      setIsCreatingCollection(false);
      setNewCollectionName('');
    } catch (error) {
      // Rollback optimistic update on error
      bookmarkData.mutateCollectionListData(
        { ...bookmarkData.collectionListData, data: currentCollections },
        { revalidate: false },
      );
      toast(commonT('error.general'), { status: ToastStatus.Error });
    } finally {
      setIsSubmittingCollection(false);
    }
  }, [newCollectionName, verse, mushafId, verseKey, bookmarkData, t, commonT, toast]);

  const handleTakeNote = useCallback((): void => {
    logButtonClick('save_bookmark_modal_take_note');
    onClose();
  }, [onClose]);

  const handleGuestSignIn = useCallback((): void => {
    logButtonClick('save_bookmark_modal_guest_sign_in');

    const redirectUrl = isVerse
      ? getChapterWithStartingVerseUrl(`${verse.chapterId}:${verse.verseNumber}`)
      : getPageNavigationUrl(pageNumber);
    router.push(`/login?r=${encodeURIComponent(redirectUrl)}`);

    onClose();
  }, [isVerse, verse, pageNumber, onClose, router]);

  const isDataReady =
    isPage ||
    (bookmarkData.collectionListData && bookmarkData.bookmarkCollectionIdsData !== undefined);
  const userIsLoggedIn = isLoggedIn();

  return {
    // State
    isTogglingFavorites,
    isCreatingCollection,
    newCollectionName,
    isSubmittingCollection,
    sortedCollections,
    isDataReady,
    userIsLoggedIn,
    mushafId,

    // Derived values
    isVerse,
    isPage,
    verseKey,
    modalTitle,
    resourceBookmark: bookmarkData.resourceBookmark,
    readingBookmarkData: bookmarkData.readingBookmarkData,
    mutateReadingBookmark: bookmarkData.mutateReadingBookmark,

    // Handlers
    setNewCollectionName,
    handleReadingBookmarkChanged,
    handleFavoritesToggle,
    handleCollectionToggle,
    handleNewCollectionClick,
    handleBackFromNewCollection,
    handleCancelNewCollection,
    handleCreateCollection,
    handleTakeNote,
    handleGuestSignIn,
  };
};

export default useSaveBookmarkModal;
