import { shallowEqual, useSelector } from 'react-redux';

import StarIcon from '../../../../public/icons/star.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';

const BookmarkIcon = ({ verseKey }: { verseKey: string }) => {
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const isVerseBookmarked = !!bookmarkedVerses[verseKey];

  if (!isVerseBookmarked) return null;

  return (
    <Button type={ButtonType.Secondary}>
      <StarIcon />
    </Button>
  );
};

export default BookmarkIcon;
