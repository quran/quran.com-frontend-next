import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { useSelector } from 'react-redux';
import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';
import StarIcon from '../../../../public/icons/star.svg';

const BookmarkIcon = ({ verseKey }: { verseKey: string }) => {
  const { bookmarkedVerses } = useSelector(selectBookmarks);
  const isVerseBookmarked = !!bookmarkedVerses[verseKey];

  if (!isVerseBookmarked) return null;

  return (
    <Button type={ButtonType.Secondary}>
      <StarIcon />
    </Button>
  );
};

export default BookmarkIcon;
