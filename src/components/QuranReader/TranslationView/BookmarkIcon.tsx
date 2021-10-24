import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import BookmarkedIcon from '../../../../public/icons/bookmark.svg';

import Button, { ButtonType } from 'src/components/dls/Button/Button';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';

const BookmarkIcon = ({ verseKey }: { verseKey: string }) => {
  const dispatch = useDispatch();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const isVerseBookmarked = !!bookmarkedVerses[verseKey];

  if (!isVerseBookmarked) return null;

  return (
    <Button
      type={ButtonType.Secondary}
      onClick={() => dispatch(toggleVerseBookmark(verseKey))}
      tooltip="Remove bookmark"
    >
      <BookmarkedIcon />
    </Button>
  );
};

export default BookmarkIcon;
