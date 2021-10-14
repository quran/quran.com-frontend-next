import styles from './SurahBlock.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from 'src/components/chapters/ChapterIcon/ChapterIconContainer';

// TODO: find a better naming
type SurahProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  chapterId: number;
};

const SurahBlock = ({ chapterId, surahName, surahNumber, translatedSurahName }: SurahProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.translatedSurahName}>{translatedSurahName}</div>
          <div className={styles.surahName}>
            Surah <br />
            {surahName}
          </div>
        </div>
        <div className={styles.surahNumber}>{surahNumber}</div>
      </div>
      <div className={styles.surahIcon}>
        <ChapterIconContainer
          chapterId={chapterId.toString()}
          hasSurahPrefix={false}
          size={ChapterIconsSize.Large}
        />
      </div>
    </div>
  );
};

export default SurahBlock;
