import { useCallback, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import BookmarkIcon from './BookmarkIcon';
import useBookmarkState from './hooks/useBookmarkState';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import { SaveBookmarkType } from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useIsMobile from '@/hooks/useIsMobile';
import { WordVerse } from '@/types/Word';
import { logButtonClick } from '@/utils/eventLogger';

const SaveBookmarkModal = dynamic(() => import('./SaveBookmarkModal'), { ssr: false });

interface Props {
  verse: WordVerse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl?: string;
}

/**
 * BookmarkAction component that displays a bookmark button/menu item for a verse.
 * Opens SaveBookmarkModal for logged-in users or GuestUserPrompt for guests.
 *
 * @param {Props} props - Component props
 * @returns {JSX.Element} The BookmarkAction component
 */
const BookmarkAction: React.FC<Props> = ({ verse, isTranslationView }): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    isVerseBookmarked,
    isVerseBookmarkedLoading,
    isVerseReadingBookmark,
    isVerseMultipleBookmarked,
  } = useBookmarkState(verse);
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();

  const onBookmarkClicked = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      logButtonClick(
        `${
          isTranslationView ? 'translation_view' : 'reading_view'
        }_verse_actions_menu_bookmark_open`,
      );

      setIsModalOpen(true);
    },
    [isTranslationView],
  );

  const onModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const bookmarkIcon = (
    <BookmarkIcon
      isLoading={isVerseBookmarkedLoading}
      isBookmarked={isVerseBookmarked}
      isVerseMultipleBookmarked={isVerseMultipleBookmarked}
      isReadingBookmark={isVerseReadingBookmark}
    />
  );

  const isBookmarked = isVerseBookmarked || isVerseMultipleBookmarked || isVerseReadingBookmark;
  const bookmarkLabel = isBookmarked ? t('bookmarked') : t('bookmark');

  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <SaveBookmarkModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        verse={verse}
        type={SaveBookmarkType.AYAH}
      />
    );
  };

  // For use in the TopActions component (standalone button)
  if (isTranslationView || (!isTranslationView && isMobile)) {
    return (
      <>
        <Button
          size={ButtonSize.Small}
          tooltip={bookmarkLabel}
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          className={classNames(
            styles.iconContainer,
            styles.verseAction,
            'bookmark-verse-action-button',
          )}
          onClick={onBookmarkClicked}
          isDisabled={isVerseBookmarkedLoading}
          ariaLabel={bookmarkLabel}
        >
          <span className={styles.icon}>{bookmarkIcon}</span>
        </Button>
        {renderModal()}
      </>
    );
  }

  // For use in the overflow menu Reading Mode Desktop (PopoverMenu.Item)
  return (
    <>
      <PopoverMenu.Item
        onClick={onBookmarkClicked}
        icon={bookmarkIcon}
        isDisabled={isVerseBookmarkedLoading}
      >
        {bookmarkLabel}
      </PopoverMenu.Item>
      {renderModal()}
    </>
  );
};

export default BookmarkAction;
