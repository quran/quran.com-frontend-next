import { useCallback, useMemo } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from '../QuranReader/TranslationView/TranslationViewCell.module.scss';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import useIsMobile from '@/hooks/useIsMobile';
import useVerseBookmark from '@/hooks/useVerseBookmark';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { WordVerse } from '@/types/Word';
import { getMushafId } from '@/utils/api';
import { logButtonClick } from '@/utils/eventLogger';

interface Props {
  verse: WordVerse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
  bookmarksRangeUrl?: string;
}

const BookmarkAction: React.FC<Props> = ({
  verse,
  isTranslationView,
  onActionTriggered,
  bookmarksRangeUrl,
}) => {
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();

  // Use custom hook for all bookmark logic
  const { isVerseBookmarked, handleToggleBookmark } = useVerseBookmark({
    verse,
    mushafId,
    bookmarksRangeUrl,
  });

  // Helper: Get event name for analytics
  const getEventName = useCallback(() => {
    const view = isTranslationView ? 'translation_view' : 'reading_view';
    const action = isVerseBookmarked ? 'un_bookmark' : 'bookmark';
    return `${view}_verse_actions_menu_${action}`;
  }, [isTranslationView, isVerseBookmarked]);

  const onToggleBookmarkClicked = useCallback(
    (e?: React.MouseEvent) => {
      // Prevent default to avoid page scroll
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // eslint-disable-next-line i18next/no-literal-string
      logButtonClick(getEventName());

      handleToggleBookmark();
      onActionTriggered?.();
    },
    [getEventName, handleToggleBookmark, onActionTriggered],
  );

  const bookmarkIcon = useMemo(() => {
    if (isVerseBookmarked) {
      return <BookmarkedIcon color="var(--color-text-default)" />;
    }
    return (
      <IconContainer
        icon={<UnBookmarkedIcon />}
        color={IconColor.tertiary}
        size={IconSize.Custom}
        shouldFlipOnRTL={false}
      />
    );
  }, [isVerseBookmarked]);

  // For use in the TopActions component (standalone button)
  if (isTranslationView || (!isTranslationView && isMobile)) {
    return (
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
        onClick={(e) => {
          onToggleBookmarkClicked(e);
        }}
        shouldFlipOnRTL={false}
        ariaLabel={isVerseBookmarked ? t('bookmarked') : t('bookmark')}
      >
        <span className={styles.icon}>{bookmarkIcon}</span>
      </Button>
    );
  }

  // For use in the overflow menu Reading Mode Desktop (PopoverMenu.Item)
  return (
    <PopoverMenu.Item onClick={onToggleBookmarkClicked} icon={bookmarkIcon}>
      {isVerseBookmarked ? `${t('bookmarked')}!` : `${t('bookmark')}`}
    </PopoverMenu.Item>
  );
};

export default BookmarkAction;
