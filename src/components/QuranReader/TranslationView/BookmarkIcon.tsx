import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useSelector } from 'react-redux';

import styles from './TranslationViewCell.module.scss';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import useVerseBookmark from '@/hooks/useVerseBookmark';
import BookmarkedIcon from '@/icons/bookmark.svg';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getMushafId } from '@/utils/api';
import { logButtonClick } from '@/utils/eventLogger';
import Verse from 'types/Verse';

type Props = {
  verse: Verse;
  bookmarksRangeUrl?: string | null; // optional so SSR fallback can render without auth
};

/**
 * BookmarkIcon component that shows a bookmark icon for bookmarked verses.
 * Only renders when the verse is bookmarked.
 *
 * @returns {JSX.Element | null} The bookmark icon button or null if not bookmarked
 */
const BookmarkIcon: React.FC<Props> = ({ verse, bookmarksRangeUrl }) => {
  const { t } = useTranslation('quran-reader');
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const mushafId = getMushafId(quranReaderStyles.quranFont, quranReaderStyles.mushafLines).mushaf;

  const { isVerseBookmarked, handleToggleBookmark } = useVerseBookmark({
    verse: {
      verseKey: verse.verseKey,
      verseNumber: verse.verseNumber,
      chapterId: verse.chapterId,
    },
    mushafId,
    bookmarksRangeUrl,
  });

  // Only show the icon when the verse is bookmarked
  if (!isVerseBookmarked) return null;

  const onClick = () => {
    logButtonClick('translation_view_un_bookmark_verse');
    handleToggleBookmark();
  };

  return (
    <Button
      className={classNames(styles.iconContainer, styles.verseAction)}
      onClick={onClick}
      tooltip={t('remove-bookmark')}
      variant={ButtonVariant.Ghost}
      size={ButtonSize.Small}
    >
      <BookmarkedIcon />
    </Button>
  );
};

export default BookmarkIcon;
