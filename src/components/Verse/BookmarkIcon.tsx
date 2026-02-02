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
  isVerseMultipleBookmarked?: boolean;
}

type BookmarkState = Pick<
  BookmarkIconProps,
  'isBookmarked' | 'isReadingBookmark' | 'isVerseMultipleBookmarked'
>;

// Prioritized icon rules; first predicate match determines the rendered icon.
const prioritizedIcons: Array<{
  predicate: (state: BookmarkState) => boolean;
  icon: JSX.Element;
}> = [
  {
    predicate: ({ isReadingBookmark, isBookmarked }) => Boolean(isReadingBookmark && isBookmarked),
    icon: <ReadingBookmarkAndOther className={styles.bookmarkIcon} />,
  },
  {
    predicate: ({ isReadingBookmark }) => Boolean(isReadingBookmark),
    icon: <BookmarkStar className={styles.bookmarkIcon} />,
  },
  {
    predicate: ({ isVerseMultipleBookmarked }) => Boolean(isVerseMultipleBookmarked),
    icon: <BookmarkMultiple className={styles.bookmarkIcon} />,
  },
  {
    predicate: ({ isBookmarked }) => Boolean(isBookmarked),
    icon: <BookmarkFilled className={styles.bookmarkIcon} />,
  },
];

const defaultIcon = (
  <IconContainer icon={<UnBookmarkedIcon />} color={IconColor.tertiary} size={IconSize.Custom} />
);

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
  isVerseMultipleBookmarked,
}): JSX.Element => {
  const match = prioritizedIcons.find(({ predicate }) =>
    predicate({ isBookmarked, isReadingBookmark, isVerseMultipleBookmarked }),
  );

  if (isLoading) {
    return <Spinner />;
  }

  return match?.icon ?? defaultIcon;
};

export default BookmarkIcon;
