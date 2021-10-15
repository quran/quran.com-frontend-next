import styles from './SurahPreviewRow.module.scss';

import ChapterIconContainer from 'src/components/chapters/ChapterIcon/ChapterIconContainer';

type SurahPreviewRowProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  description: string;
  chapterId: number;
};
const SurahPreviewRow = ({
  surahName,
  surahNumber,
  translatedSurahName,
  description,
  chapterId,
}: SurahPreviewRowProps) => {
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
        <div className={styles.description}>{description}</div>
      </div>
    </div>
  );
};

export default SurahPreviewRow;
