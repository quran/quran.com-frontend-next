import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import BookmarkedIcon from '../../../../public/icons/bookmark.svg';

import Button, { ButtonSize, ButtonType, ButtonVariant } from 'src/components/dls/Button/Button';
import { selectBookmarks, toggleVerseBookmark } from 'src/redux/slices/QuranReader/bookmarks';
import { logButtonClick } from 'src/utils/eventLogger';

const BookmarkIcon = ({ verseKey }: { verseKey: string }) => {
  const { t } = useTranslation('quran-reader');
  const dispatch = useDispatch();
  const bookmarkedVerses = useSelector(selectBookmarks, shallowEqual);
  const isVerseBookmarked = !!bookmarkedVerses[verseKey];

  if (!isVerseBookmarked) return null;

  return (
    <Button
      type={ButtonType.Secondary}
      onClick={() => {
        logButtonClick('translation_view_un_bookmark_verse');
        dispatch(toggleVerseBookmark(verseKey));
      }}
      tooltip={t('remove-bookmark')}
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
    >
      <BookmarkedIcon />
    </Button>
  );
};

export default BookmarkIcon;
