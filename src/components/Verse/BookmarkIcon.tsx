import Spinner from '@/components/dls/Spinner/Spinner';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import BookmarkedIcon from '@/icons/bookmark.svg';
import UnBookmarkedIcon from '@/icons/unbookmarked.svg';

interface BookmarkIconProps {
  isLoading: boolean;
  isBookmarked: boolean;
}

/**
 * Renders the appropriate bookmark icon based on loading and bookmark state.
 *
 * @param {BookmarkIconProps} props - Component props
 * @returns {JSX.Element} The bookmark icon
 */
const BookmarkIcon: React.FC<BookmarkIconProps> = ({ isLoading, isBookmarked }): JSX.Element => {
  if (isLoading) {
    return <Spinner />;
  }

  if (isBookmarked) {
    return <BookmarkedIcon color="var(--color-text-default)" />;
  }

  return (
    <IconContainer icon={<UnBookmarkedIcon />} color={IconColor.tertiary} size={IconSize.Custom} />
  );
};

export default BookmarkIcon;
