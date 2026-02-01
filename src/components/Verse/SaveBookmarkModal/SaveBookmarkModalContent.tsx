import CollectionsList from './Collections/CollectionsList';
import { CollectionItem } from './Collections/CollectionsListItem';
import GuestSignInSection from './GuestSignInSection';
import ReadingBookmarkSection from './ReadingBookmarkSection';
import styles from './SaveBookmarkModal.module.scss';
import SaveBookmarkModalFooter from './SaveBookmarkModalFooter';
import SaveBookmarkModalHeader from './SaveBookmarkModalHeader';

import Bookmark, { ReadingBookmarkType } from '@/types/Bookmark';

interface SaveBookmarkModalContentProps {
  // Header props
  modalTitle: string;
  onClose: () => void;
  onBack?: () => void;

  // Reading bookmark props
  isVerse: boolean;
  isPage: boolean;
  verseKey: string;
  pageNumber?: number;
  userIsLoggedIn: boolean;
  mushafId: number;
  lang: string;
  readingBookmarkData?: Bookmark | null;
  mutateReadingBookmark?: (
    data?: Bookmark | null | Promise<Bookmark | null>,
    opts?: { revalidate?: boolean },
  ) => Promise<Bookmark | null | undefined>;
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
  onBack,
  isVerse,
  isPage,
  verseKey,
  pageNumber,
  userIsLoggedIn,
  mushafId,
  lang,
  readingBookmarkData,
  mutateReadingBookmark,
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
      <SaveBookmarkModalHeader title={modalTitle} onClose={onClose} onBack={onBack} />

      <ReadingBookmarkSection
        type={isVerse ? ReadingBookmarkType.AYAH : ReadingBookmarkType.PAGE}
        verseKey={isVerse ? verseKey : undefined}
        pageNumber={isPage ? pageNumber : undefined}
        isLoggedIn={userIsLoggedIn}
        mushafId={mushafId}
        readingBookmarkData={readingBookmarkData}
        mutateReadingBookmark={mutateReadingBookmark}
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
