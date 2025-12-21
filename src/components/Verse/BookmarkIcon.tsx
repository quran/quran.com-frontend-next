import styles from './BookmarkIcon.module.scss';

import Spinner from '@/components/dls/Spinner/Spinner';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import BookmarkMultiple from '@/icons/bookmark-multiple.svg';
import BookmarkStar from '@/icons/bookmark-star.svg';
import BookmarkFilled from '@/icons/bookmark_new.svg';
import ReadingBookmarkAndOther from '@/icons/reading-bookmark-and-other.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';

interface BookmarkIconProps {
  isLoading: boolean;
  isBookmarked: boolean;
  isReadingBookmark?: boolean;
  isCollectionBookmarked?: boolean;
}

/**
 * Renders the appropriate bookmark icon based on loading and bookmark state.
 *
 * @param {BookmarkIconProps} props - Component props
 * @returns {JSX.Element} The bookmark icon
 */
const BookmarkIcon: React.FC<BookmarkIconProps> = ({
  isLoading,
  isBookmarked,
  isReadingBookmark,
  isCollectionBookmarked,
}): JSX.Element => {
  if (isLoading) {
    return <Spinner />;
  }

  if (isReadingBookmark && (isCollectionBookmarked || isBookmarked)) {
    return <ReadingBookmarkAndOther className={styles.bookmarkIcon} />;
  }

  if (isBookmarked && isCollectionBookmarked) {
    return <BookmarkMultiple className={styles.bookmarkIcon} />;
  }

  if (isReadingBookmark) {
    return <BookmarkStar className={styles.bookmarkIcon} />;
  }

  if (isBookmarked) {
    return <BookmarkFilled className={styles.bookmarkIcon} />;
  }

  return (
    <IconContainer icon={<UnBookmarkedIcon />} color={IconColor.tertiary} size={IconSize.Custom} />
  );
};

export default BookmarkIcon;
