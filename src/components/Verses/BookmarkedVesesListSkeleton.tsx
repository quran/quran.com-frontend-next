import styles from './BookmarkedVersesListSkeleton.module.scss';
import BookmarkPill from './BookmarkPill';

import Skeleton from '@/dls/Skeleton/Skeleton';

const BOOKMARKS_COUNT = 10;
const bookmarksArr = Array(BOOKMARKS_COUNT).fill(null);

const BookmarkedVersesListSkeleton = () => {
  return (
    <span className={styles.skeletonContainer}>
      {bookmarksArr.map((k, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Skeleton key={`skeleton_${i}`} isActive className={styles.skeletonItem}>
          <BookmarkPill verseKey="1:1" onDeleted={() => null} />
        </Skeleton>
      ))}
    </span>
  );
};

export default BookmarkedVersesListSkeleton;
