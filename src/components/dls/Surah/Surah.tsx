import styles from './Surah.module.scss';

import ChapterIconContainer from 'src/components/chapters/ChapterIcon/ChapterIconContainer';

// TODO: find a better naming
type SurahProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  verseCount: number;
  chapterId: number;
};
const Surah = ({
  surahName,
  surahNumber,
  translatedSurahName,
  verseCount,
  chapterId,
}: SurahProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div className={styles.surahNumber}>
          <span>{surahNumber}</span>
        </div>
        <div className={styles.surahNameContainer}>
          <div className={styles.surahName}>{surahName}</div>
          <div className={styles.translatedSurahName}>{translatedSurahName}</div>
        </div>
      </div>
      <div className={styles.right}>
        <div>
          <ChapterIconContainer chapterId={chapterId.toString()} hasSurahPrefix={false} />
        </div>
        <div className={styles.verseCount}>{verseCount} Ayahs</div>
      </div>
    </div>
  );
};

export default Surah;
