/* eslint-disable max-lines */
import { useCallback, useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import { CollectionItem } from './Collections/CollectionsListItem';
import { useCollectionsState } from './Collections/hooks/useCollectionsState';
import { useCollectionToggleHandler } from './Collections/hooks/useCollectionToggleHandler';
import { useFavoritesToggle } from './Collections/hooks/useFavoritesToggle';
import { useSaveBookmarkData } from './useSaveBookmarkData';

import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import { logError } from '@/lib/newrelic';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import { ReadingBookmarkType } from '@/types/Bookmark';
import BookmarkType from '@/types/BookmarkType';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';

interface UseSaveBookmarkModalOptions {
  type: ReadingBookmarkType;
  verse?: WordVerse;
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
  currentReadingBookmark: string | null | undefined;

  // Handlers
  setNewCollectionName: (name: string) => void;
  handleUpdateReadingBookmark: (
    key: string,
    value: string,
    group: string,
    id: number,
  ) => Promise<void>;
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
    isPage,
    isResourceBookmarked: !!bookmarkData.resourceBookmark,
    resourceBookmark: bookmarkData.resourceBookmark,
    collectionListData: bookmarkData.collectionListData,
    bookmarkCollectionIdsData: bookmarkData.bookmarkCollectionIdsData,
  });

  // Handler hooks
  const verseKey = verse ? `${verse.chapterId}:${verse.verseNumber}` : '';

  const favoritesToggle = useFavoritesToggle({
    verse,
    pageNumber,
    mushafId,
    resourceBookmark: bookmarkData.resourceBookmark,
    bookmarkCollectionIdsData: bookmarkData.bookmarkCollectionIdsData,
    verseKey,
    isResourceBookmarked: !!bookmarkData.resourceBookmark,
    mutateResourceBookmark: bookmarkData.mutateResourceBookmark,
    mutateBookmarkCollectionIdsData: bookmarkData.mutateBookmarkCollectionIdsData,
    onToast: (message, status) => toast(message, { status }),
  });

  const { handleAddToCollection, handleRemoveFromCollection } = useCollectionToggleHandler({
    verse,
    mushafId,
    verseKey,
    resourceBookmark: bookmarkData.resourceBookmark,
    bookmarkCollectionIdsData: bookmarkData.bookmarkCollectionIdsData,
    onMutate: bookmarkData.mutateAllData,
  });

  // Localization
  const localizedVerseKey = verse ? toLocalizedVerseKey(verseKey, lang) : '';
  const localizedPageNumber = pageNumber ? toLocalizedNumber(pageNumber, lang) : '';

  const modalTitle = isVerse
    ? t('save-verse', { verseKey: localizedVerseKey })
    : t('save-page', { pageNumber: localizedPageNumber });

  // Handlers
  const handleUpdateReadingBookmark = useCallback(
    async (key: string, value: string, group: string, id: number): Promise<void> => {
      try {
        await addOrUpdateUserPreference(key, value, group as PreferenceGroup, id);
      } catch (error) {
        logError('Failed to update reading bookmark preference:', error);
        throw error;
      }
    },
    [],
  );

  const handleReadingBookmarkChanged = useCallback(async (): Promise<void> => {
    bookmarkData.mutateAllData();
  }, [bookmarkData]);

  const handleFavoritesToggle = useCallback(async (): Promise<void> => {
    setIsTogglingFavorites(true);
    try {
      if (isVerse && bookmarkData.resourceBookmark) {
        await favoritesToggle.handleVerseBookmarkToggle();
      } else if (isPage) {
        await favoritesToggle.handlePageBookmarkToggle();
      } else if (isVerse && !bookmarkData.resourceBookmark && verse) {
        await favoritesToggle.handleNewVerseBookmark();
      }
      bookmarkData.mutateAllData();
    } catch (error) {
      const status = getErrorStatus(error);
      const errorMessage =
        status === 400 ? commonT('error.bookmark-sync') : commonT('error.general');
      toast(errorMessage, { status: ToastStatus.Error });
    } finally {
      setIsTogglingFavorites(false);
    }
  }, [isVerse, isPage, bookmarkData, favoritesToggle, verse, commonT, toast]);

  const handleCollectionToggle = useCallback(
    async (collection: CollectionItem, checked: boolean): Promise<void> => {
      if (collection.isDefault) {
        await handleFavoritesToggle();
        return;
      }

      if (checked) {
        await handleAddToCollection(collection.id, collection.name);
      } else {
        await handleRemoveFromCollection(collection.id, collection.name);
      }
    },
    [handleFavoritesToggle, handleAddToCollection, handleRemoveFromCollection],
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

  const handleCreateCollection = useCallback(async (): Promise<void> => {
    if (!newCollectionName.trim() || !verse) return;
    setIsSubmittingCollection(true);
    try {
      const { addCollection, addCollectionBookmark } = await import('@/utils/auth/api');
      const newCollection = await addCollection(newCollectionName.trim());
      await addCollectionBookmark({
        key: Number(verse.chapterId),
        mushaf: mushafId,
        type: BookmarkType.Ayah,
        verseNumber: verse.verseNumber,
        collectionId: (newCollection as { id: string }).id,
      });
      toast(t('saved-to', { collectionName: newCollectionName.trim() }), {
        status: ToastStatus.Success,
      });
      logEvent('collection_created_and_ayah_added', {
        verseKey,
        collectionName: newCollectionName.trim(),
      });
      bookmarkData.mutateAllData();
      setIsCreatingCollection(false);
      setNewCollectionName('');
    } catch (error) {
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
      ? `/chapter/${verse?.chapterId}/${verse?.verseNumber}`
      : `/page/${pageNumber}`;
    router.push(`/auth/signin?redirect=${encodeURIComponent(redirectUrl)}`);
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
    currentReadingBookmark: bookmarkData.currentReadingBookmark,

    // Handlers
    setNewCollectionName,
    handleUpdateReadingBookmark,
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

/**
 * Extracts HTTP status code from an error object.
 * @returns {number | undefined} HTTP status code
 * @param {unknown} error - The error object
 */
const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    return (err.status ?? err.statusCode ?? (err.response as Record<string, unknown>)?.status) as
      | number
      | undefined;
  }
  return undefined;
};

export default useSaveBookmarkModal;
