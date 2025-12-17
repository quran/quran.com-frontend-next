/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { useCallback, useEffect, useMemo, useState } from 'react';

import classNames from 'classnames';
import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';
import useSWRImmutable from 'swr/immutable';

import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import Spinner from '@/components/dls/Spinner/Spinner';
import { SaveBookmarkType } from '@/components/Verse/SaveBookmarkModal/SaveBookmarkModal';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useIsMobile from '@/hooks/useIsMobile';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectBookmarks } from '@/redux/slices/QuranReader/bookmarks';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import BookmarkType from '@/types/BookmarkType';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { getBookmark } from '@/utils/auth/api';
import { makeBookmarkUrl } from '@/utils/auth/apiPaths';
import { isLoggedIn } from '@/utils/auth/login';
import { logButtonClick } from '@/utils/eventLogger';

const SaveBookmarkModal = dynamic(() => import('./SaveBookmarkModal'), { ssr: false });

interface Props {
  verse: WordVerse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl?: string;
}

/**
 * BookmarkAction component that displays a bookmark button/menu item for a verse
 * Opens SaveBookmarkModal for logged-in users or GuestUserPrompt for guests
 *
 * @returns {JSX.Element} The BookmarkAction component
 */
const BookmarkAction: React.FC<Props> = ({ verse, isTranslationView }): JSX.Element => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();

  const { data: bookmark, isValidating: isVerseBookmarkedLoading } = useSWRImmutable(
    isLoggedIn()
      ? makeBookmarkUrl(
          mushafId,
          Number(verse.chapterId),
          BookmarkType.Ayah,
          Number(verse.verseNumber),
        )
      : null,
    async () => {
      const response = await getBookmark(
        mushafId,
        Number(verse.chapterId),
        BookmarkType.Ayah,
        Number(verse.verseNumber),
      );
      return response;
    },
  );

  const isVerseBookmarked = useMemo(() => {
    const isUserLoggedIn = isLoggedIn();
    if (isUserLoggedIn && bookmark) {
      return bookmark;
    }
    if (!isUserLoggedIn) {
      return !!bookmarkedVerses[verse.verseKey];
    }
    return false;
  }, [bookmarkedVerses, bookmark, verse.verseKey]);

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

  const onModalClose = () => {
    setIsModalOpen(false);
  };

  // Cleanup effect to ensure modal state is cleaned up when component unmounts
  useEffect(() => {
    return () => {
      if (isModalOpen) {
        setIsModalOpen(false);
      }
    };
  }, [isModalOpen]);

  let bookmarkIcon = <Spinner />;
  if (!isVerseBookmarkedLoading) {
    bookmarkIcon = isVerseBookmarked ? (
      <BookmarkedIcon color="var(--color-text-default)" />
    ) : (
      <IconContainer
        icon={<UnBookmarkedIcon />}
        color={IconColor.tertiary}
        size={IconSize.Custom}
      />
    );
  }

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
          tooltip={isVerseBookmarked ? t('bookmarked') : t('bookmark')}
          variant={ButtonVariant.Ghost}
          shape={ButtonShape.Circle}
          className={classNames(
            styles.iconContainer,
            styles.verseAction,
            'bookmark-verse-action-button',
          )}
          onClick={onBookmarkClicked}
          isDisabled={isVerseBookmarkedLoading}
          ariaLabel={isVerseBookmarked ? t('bookmarked') : t('bookmark')}
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
        {isVerseBookmarked ? t('bookmarked') : t('bookmark')}
      </PopoverMenu.Item>
      {renderModal()}
    </>
  );
};

export default BookmarkAction;
