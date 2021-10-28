import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import BookmarkedIcon from '../../../../public/icons/bookmark.svg';

import Button, { ButtonSize, ButtonType } from 'src/components/dls/Button/Button';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';

const BookmarkIcon = ({ verseKey }: { verseKey: string }) => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const isVerseBookmarked = !!bookmarkedVerses[verseKey];

  if (!isVerseBookmarked) return null;

  return (
    <Button
      type={ButtonType.Secondary}
      onClick={() => dispatch(toggleVerseBookmark(verseKey))}
      tooltip={t('remove-bookmark')}
      size={ButtonSize.Small}
    >
      <BookmarkedIcon />
    </Button>
  );
};

export default BookmarkIcon;
