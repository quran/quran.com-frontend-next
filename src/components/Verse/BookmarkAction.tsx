import { useCallback } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import BookmarkIcon from './BookmarkIcon';
import useBookmarkState from './hooks/useBookmarkState';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useIsMobile from '@/hooks/useIsMobile';
import {
  selectStudyModeActiveTab,
  selectStudyModeHighlightedWordLocation,
  selectStudyModeIsOpen,
  selectStudyModeIsSsrMode,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import { openBookmarkModal } from '@/redux/slices/QuranReader/verseActionModal';
import Verse from '@/types/Verse';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  verse: Verse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl?: string;
  isInsideStudyMode?: boolean;
}

/**
 * BookmarkAction component that displays a bookmark button/menu item for a verse.
 * Opens SaveBookmarkModal for logged-in users or GuestUserPrompt for guests.
 * Dispatches Redux action to open the modal in VerseActionModalContainer.
 *
 * @param {Props} props - Component props
 * @returns {JSX.Element} The BookmarkAction component
 */
const BookmarkAction: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  isInsideStudyMode = false,
}): JSX.Element => {
  const dispatch = useDispatch();
  const {
    isVerseBookmarked,
    isVerseBookmarkedLoading,
    isVerseReadingBookmark,
    isVerseMultipleBookmarked,
  } = useBookmarkState(verse);
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();

  // Redux selectors for study mode state
  const isStudyModeOpen = useSelector(selectStudyModeIsOpen);
  const isSsrMode = useSelector(selectStudyModeIsSsrMode);
  const studyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const studyModeActiveTab = useSelector(selectStudyModeActiveTab);
  const studyModeHighlightedWordLocation = useSelector(selectStudyModeHighlightedWordLocation);

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

      // Determine if opened from study mode
      const openedFromStudyMode = isInsideStudyMode || (isStudyModeOpen && !isSsrMode);

      dispatch(
        openBookmarkModal({
          verseKey: verse.verseKey,
          verse,
          isTranslationView,
          wasOpenedFromStudyMode: openedFromStudyMode,
          studyModeRestoreState:
            openedFromStudyMode && studyModeVerseKey
              ? {
                  verseKey: studyModeVerseKey,
                  activeTab: studyModeActiveTab,
                  highlightedWordLocation: studyModeHighlightedWordLocation,
                  isSsrMode,
                }
              : undefined,
        }),
      );

      if (onActionTriggered) {
        onActionTriggered();
      }
    },
    [
      verse,
      isTranslationView,
      isInsideStudyMode,
      isStudyModeOpen,
      isSsrMode,
      studyModeVerseKey,
      studyModeActiveTab,
      studyModeHighlightedWordLocation,
      dispatch,
      onActionTriggered,
    ],
  );

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

  // For use in the TopActions component (standalone button)
  if (isTranslationView || (!isTranslationView && isMobile)) {
    return (
      <Button
        size={ButtonSize.Small}
        tooltip={bookmarkLabel}
        variant={ButtonVariant.Ghost}
        shape={ButtonShape.Circle}
        className={classNames(styles.iconContainer, styles.verseAction, styles.bookmarkAction, {
          [styles.bookmarkActionActive]: isBookmarked,
        })}
        onClick={onBookmarkClicked}
        isDisabled={isVerseBookmarkedLoading}
        ariaLabel={bookmarkLabel}
      >
        <span className={styles.icon}>{bookmarkIcon}</span>
      </Button>
    );
  }

  // For use in the overflow menu Reading Mode Desktop (PopoverMenu.Item)
  return (
    <PopoverMenu.Item
      onClick={onBookmarkClicked}
      icon={bookmarkIcon}
      isDisabled={isVerseBookmarkedLoading}
    >
      {bookmarkLabel}
    </PopoverMenu.Item>
  );
};

export default BookmarkAction;
