import styles from './Surah.module.scss';
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
      <div className={styles.surahNumber}>{surahNumber}</div>
      <div className={styles.surahNameContainer}>
        <div className={styles.surahName}>{surahName}</div>
        <div className={styles.translatedSurahName}>{translatedSurahName}</div>
      </div>
      <div>
        <div>{chapterId} logo</div>
        <div>{verseCount}</div>
      </div>
    </div>
  );
};

export default Surah;
