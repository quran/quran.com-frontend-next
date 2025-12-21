import CollectionsList from './Collections/CollectionsList';
import { CollectionItem } from './Collections/CollectionsListItem';
import GuestSignInSection from './GuestSignInSection';
import ReadingBookmarkSection from './ReadingBookmarkSection';
import styles from './SaveBookmarkModal.module.scss';
import SaveBookmarkModalFooter from './SaveBookmarkModalFooter';
import SaveBookmarkModalHeader from './SaveBookmarkModalHeader';

import { ReadingBookmarkType } from '@/types/Bookmark';

interface SaveBookmarkModalContentProps {
  // Header props
  modalTitle: string;
  onClose: () => void;

  // Reading bookmark props
  isVerse: boolean;
  isPage: boolean;
  verseKey: string;
  pageNumber?: number;
  currentReadingBookmark: string | null | undefined;
  userIsLoggedIn: boolean;
  mushafId: number;
  lang: string;
  onUpdateReadingBookmark: (key: string, value: string, group: string, id: number) => Promise<void>;
  onReadingBookmarkChanged: () => Promise<void>;

  // Collections props
  sortedCollections: CollectionItem[];
  isDataReady: boolean;
  isTogglingFavorites: boolean;
  onCollectionToggle: (collection: CollectionItem, checked: boolean) => Promise<void>;
  onNewCollectionClick: () => void;

  // Guest section props
  onGuestSignIn: () => void;

  // Footer props
  onTakeNote: () => void;
}

/**
 * Main content component for SaveBookmarkModal.
 * Composes the header, reading bookmark section, collections list, and footer.
 * @param {SaveBookmarkModalContentProps} props - Props for the SaveBookmarkModalContent component
 * @returns {JSX.Element} The SaveBookmarkModalContent component
 */
const SaveBookmarkModalContent: React.FC<SaveBookmarkModalContentProps> = ({
  modalTitle,
  onClose,
  isVerse,
  isPage,
  verseKey,
  pageNumber,
  currentReadingBookmark,
  userIsLoggedIn,
  mushafId,
  lang,
  onUpdateReadingBookmark,
  onReadingBookmarkChanged,
  sortedCollections,
  isDataReady,
  isTogglingFavorites,
  onCollectionToggle,
  onNewCollectionClick,
  onGuestSignIn,
  onTakeNote,
}) => {
  return (
    <div className={styles.container}>
      <SaveBookmarkModalHeader title={modalTitle} onClose={onClose} />

      <ReadingBookmarkSection
        type={isVerse ? ReadingBookmarkType.AYAH : ReadingBookmarkType.PAGE}
        verseKey={isVerse ? verseKey : undefined}
        pageNumber={isPage ? pageNumber : undefined}
        currentReadingBookmark={currentReadingBookmark}
        isLoggedIn={userIsLoggedIn}
        mushafId={mushafId}
        onUpdateUserPreference={onUpdateReadingBookmark}
        onBookmarkChanged={onReadingBookmarkChanged}
        lang={lang}
      />

      {userIsLoggedIn && isVerse && (
        <CollectionsList
          collections={sortedCollections}
          isDataReady={isDataReady}
          isTogglingFavorites={isTogglingFavorites}
          onCollectionToggle={onCollectionToggle}
          onNewCollectionClick={onNewCollectionClick}
        />
      )}

      {!userIsLoggedIn && isVerse && <GuestSignInSection onSignIn={onGuestSignIn} />}

      <SaveBookmarkModalFooter
        showNoteButton={isVerse && userIsLoggedIn}
        onTakeNote={onTakeNote}
        onDone={onClose}
      />
    </div>
  );
};

export default SaveBookmarkModalContent;
