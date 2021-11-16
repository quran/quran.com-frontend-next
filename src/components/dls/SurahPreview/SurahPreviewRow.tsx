import classNames from 'classnames';

import styles from './SurahPreviewRow.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from 'src/components/chapters/ChapterIcon/ChapterIconContainer';

type SurahPreviewRowProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  description: string;
  chapterId: number;
  isMinimalLayout?: boolean;
};
const SurahPreviewRow = ({
  surahName,
  surahNumber,
  translatedSurahName,
  description,
  chapterId,
  isMinimalLayout = false,
}: SurahPreviewRowProps) => {
  if (isMinimalLayout) {
    return (
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.surahNumber}>
            <span>{surahNumber}</span>
          </div>
          <ChapterIconContainer
            chapterId={chapterId.toString()}
            hasSurahPrefix={false}
            size={ChapterIconsSize.Large}
          />
        </div>
        <div className={styles.right}>
          {description && (
            <div className={classNames(styles.description, styles.largeText)}>{description}</div>
          )}
        </div>
      </div>
    );
  }
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
        {description && <div className={styles.description}>{description}</div>}
      </div>
    </div>
  );
};

export default SurahPreviewRow;
