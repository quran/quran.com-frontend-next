import React, { useCallback, useState } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import styles from '../styles/ContextMenu.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import { SaveBookmarkType } from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal';
import { useVerseBookmark } from '@/hooks/useVerseBookmark';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { logButtonClick } from '@/utils/eventLogger';
import Verse from 'types/Verse';

const SaveBookmarkModal = dynamic(
  () => import('@/components/Verse/SaveBookmarkModal/SaveBookmarkModal'),
  { ssr: false },
);

interface VerseBookmarkActionProps {
  verse: Verse;
}

/**
 * Component for bookmarking a Quran verse
 * Opens SaveBookmarkModal for both logged-in users and guests
 *
 * @returns {JSX.Element} A React component that displays a bookmark icon for the current verse
 */
const VerseBookmarkAction: React.FC<VerseBookmarkActionProps> = React.memo(({ verse }) => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isVerseBookmarked, isLoading } = useVerseBookmark(verse);

  const onModalClose = useCallback((): void => {
    setIsModalOpen(false);
  }, []);

  const onBookmarkClicked = useCallback((): void => {
    logButtonClick('context_menu_verse_bookmark_open');
    setIsModalOpen(true);
  }, []);

  let bookmarkIcon = <Spinner />;
  if (!isLoading) {
    bookmarkIcon = isVerseBookmarked ? (
      <BookmarkedIcon className={styles.bookmarkedIcon} />
    ) : (
      <UnBookmarkedIcon className={styles.unbookmarkedIcon} />
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.bookmarkButton}
        onClick={onBookmarkClicked}
        disabled={isLoading}
        aria-label={
          isVerseBookmarked ? t('quran-reader:remove-bookmark') : t('quran-reader:add-bookmark')
        }
      >
        {bookmarkIcon}
      </button>
      <SaveBookmarkModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        type={SaveBookmarkType.AYAH}
        verse={verse}
      />
    </>
  );
});

export default VerseBookmarkAction;
