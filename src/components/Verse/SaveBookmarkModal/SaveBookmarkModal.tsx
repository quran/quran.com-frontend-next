/* eslint-disable max-lines */
import { useCallback } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import { logError } from '../../../lib/newrelic';

import CollectionsList from './Collections/CollectionsList';
import { CollectionItem } from './Collections/CollectionsListItem';
import { useCollectionsState } from './Collections/hooks/useCollectionsState';
import { useCollectionToggleHandler } from './Collections/hooks/useCollectionToggleHandler';
import NewCollectionForm from './Collections/NewCollectionForm';
import GuestSignInSection from './GuestSignInSection';
import { useFavoritesToggleHandler } from './hooks/useFavoritesToggleHandler';
import { useNewCollectionForm } from './hooks/useNewCollectionForm';
import ReadingBookmarkSection, {
  ReadingBookmarkType,
} from './ReadingBookmarkSection/ReadingBookmarkSection';
import styles from './SaveBookmarkModal.module.scss';
import { useSaveBookmarkData } from './useSaveBookmarkData';

import Button, { ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import { ModalSize } from '@/dls/Modal/Content';
import Modal from '@/dls/Modal/Modal';
import CloseIcon from '@/icons/close.svg';
import NoteIcon from '@/icons/notes-with-pencil.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { addOrUpdateUserPreference } from '@/utils/auth/api';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';
import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';

export enum SaveBookmarkType {
  Verse = 'verse',
  Page = 'page',
}

interface SaveBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: SaveBookmarkType;
  verse?: WordVerse;
  pageNumber?: number;
}

/**
 * Modal component for saving a verse/page to collections and setting reading bookmark
 * Uses custom hooks for logic extraction and sub-components for UI composition
 * @param {SaveBookmarkModalProps} props Component props
 * @returns {React.ReactElement} The SaveBookmarkModal component
 */
const SaveBookmarkModal: React.FC<SaveBookmarkModalProps> = ({
  isOpen,
  onClose,
  type,
  verse,
  pageNumber,
}: SaveBookmarkModalProps) => {
  const { t, lang } = useTranslation('quran-reader');
  const commonT = useTranslation('common').t;
  const router = useRouter();

  const isVerse = type === SaveBookmarkType.Verse;
  const isPage = type === SaveBookmarkType.Page;
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

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

  const { handleAddToCollection, handleRemoveFromCollection } = useCollectionToggleHandler({
    verse,
    mushafId,
    verseKey,
    resourceBookmark: bookmarkData.resourceBookmark,
    bookmarkCollectionIdsData: bookmarkData.bookmarkCollectionIdsData,
    onMutate: bookmarkData.mutateAllData,
  });

  const { isTogglingFavorites, handleFavoritesToggle } = useFavoritesToggleHandler({
    verse,
    pageNumber,
    mushafId,
    resourceBookmark: bookmarkData.resourceBookmark,
    bookmarkCollectionIdsData: bookmarkData.bookmarkCollectionIdsData,
    verseKey,
    isResourceBookmarked: !!bookmarkData.resourceBookmark,
    isVerse,
    isPage,
    mutateResourceBookmark: bookmarkData.mutateResourceBookmark,
    mutateBookmarkCollectionIdsData: bookmarkData.mutateBookmarkCollectionIdsData,
    mutateAllData: bookmarkData.mutateAllData,
  });

  const {
    isCreatingCollection,
    newCollectionName,
    isSubmittingCollection,
    setNewCollectionName,
    handleNewCollectionClick,
    handleBackFromNewCollection,
    handleCancelNewCollection,
    handleCreateCollection,
  } = useNewCollectionForm({
    verse,
    mushafId,
    verseKey,
    onMutateData: bookmarkData.mutateAllData,
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

  const handleReadingBookmarkChanged = useCallback(async () => {
    bookmarkData.mutateAllData();
  }, [bookmarkData]);

  const handleCollectionToggle = async (
    collection: CollectionItem,
    checked: boolean,
  ): Promise<void> => {
    if (collection.isDefault) {
      await handleFavoritesToggle();
      return;
    }

    if (checked) {
      await handleAddToCollection(collection.id, collection.name);
    } else {
      await handleRemoveFromCollection(collection.id, collection.name);
    }
  };

  const handleTakeNote = (): void => {
    logButtonClick('save_bookmark_modal_take_note');
    onClose();
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onClickOutside={onClose}
      onEscapeKeyDown={onClose}
      isBottomSheetOnMobile
      size={ModalSize.MEDIUM}
    >
      <Modal.Body>
        {isCreatingCollection ? (
          <NewCollectionForm
            onBack={handleBackFromNewCollection}
            onClose={onClose}
            onCancel={handleCancelNewCollection}
            onCreate={handleCreateCollection}
            newCollectionName={newCollectionName}
            onNameChange={setNewCollectionName}
            isSubmittingCollection={isSubmittingCollection}
          />
        ) : (
          <div className={styles.container}>
            <div className={styles.header}>
              <Modal.Title>
                <span className={styles.title}>{modalTitle}</span>
              </Modal.Title>
              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label={commonT('close')}
              >
                <CloseIcon />
              </button>
            </div>

            <ReadingBookmarkSection
              type={isVerse ? ReadingBookmarkType.Verse : ReadingBookmarkType.Page}
              verseKey={isVerse ? verseKey : undefined}
              pageNumber={isPage ? pageNumber : undefined}
              currentReadingBookmark={bookmarkData.currentReadingBookmark}
              isLoggedIn={userIsLoggedIn}
              mushafId={mushafId}
              onUpdateUserPreference={handleUpdateReadingBookmark}
              onBookmarkChanged={handleReadingBookmarkChanged}
              lang={lang}
            />

            {userIsLoggedIn && isVerse && (
              <CollectionsList
                collections={sortedCollections}
                isDataReady={isDataReady}
                isTogglingFavorites={isTogglingFavorites}
                onCollectionToggle={handleCollectionToggle}
                onNewCollectionClick={handleNewCollectionClick}
              />
            )}

            {!userIsLoggedIn && <GuestSignInSection onSignIn={handleGuestSignIn} />}

            <div className={styles.footer}>
              {isVerse && userIsLoggedIn && (
                <Button
                  variant={ButtonVariant.Outlined}
                  size={ButtonSize.Medium}
                  onClick={handleTakeNote}
                  className={styles.noteButton}
                >
                  <NoteIcon />
                  {t('take-a-note')}
                </Button>
              )}
              <Button
                type={ButtonType.Primary}
                size={ButtonSize.Medium}
                onClick={onClose}
                className={styles.doneButton}
              >
                {commonT('done')}
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default SaveBookmarkModal;
