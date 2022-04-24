import styles from './ChapterList.module.scss';
import ChapterListItem from './ChapterListItem';

import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

type ChaptersListProps = {
  filteredChapters: Chapter[];
  selectedReciter: Reciter;
};

const ChaptersList = ({ filteredChapters, selectedReciter }: ChaptersListProps) => {
  return (
    <div className={styles.chapterListContainer}>
      {filteredChapters?.map((chapter) => (
        <ChapterListItem key={chapter?.id} chapter={chapter} selectedReciter={selectedReciter} />
      ))}
      <div />
    </div>
  );
};

export default ChaptersList;
