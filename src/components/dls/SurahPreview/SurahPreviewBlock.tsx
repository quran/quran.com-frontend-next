import useTranslation from 'next-translate/useTranslation';

import styles from './SurahPreviewBlock.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from 'src/components/chapters/ChapterIcon/ChapterIconContainer';

type SurahPreviewBlockProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  chapterId: number;
  description?: string;
};

const SurahPreviewBlock = ({
  chapterId,
  surahName,
  surahNumber,
  translatedSurahName,
  description,
}: SurahPreviewBlockProps) => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.translatedSurahName}>{translatedSurahName}</div>
          <div className={styles.surahName}>
            {t('surah')} <br />
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
        {description && <div className={styles.description}>{description}</div>}
      </div>
    </div>
  );
};

export default SurahPreviewBlock;
