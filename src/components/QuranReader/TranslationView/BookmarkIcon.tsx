import Button, { ButtonSize, ButtonVariant } from 'src/components/dls/Button/Button';
import { useSelector } from 'react-redux';
import { selectBookmarks } from 'src/redux/slices/QuranReader/bookmarks';
import StarIcon from '../../../../public/icons/star.svg';
import styles from './TranslationView.module.scss';

const BookmarkIcon = ({ verseKey }: { verseKey: string }) => {
  const { bookmarkedVerses } = useSelector(selectBookmarks);
  const isVerseBookmarked = !!bookmarkedVerses[verseKey];

  if (!isVerseBookmarked)
    //   render the dom to maintain the height
    return <div className={styles.bookmarkIconContainer} />;

  return (
    <div className={styles.bookmarkIconContainer}>
      <Button size={ButtonSize.Small} variant={ButtonVariant.Ghost}>
        <StarIcon />
      </Button>
    </div>
  );
};

export default BookmarkIcon;
