import { useMemo } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';

import styles from './SurahPreviewRow.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Spinner from '@/dls/Spinner/Spinner';
import { toLocalizedNumber } from '@/utils/locale';

type SurahPreviewRowProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  description: string;
  chapterId: number;
  isMinimalLayout?: boolean;
  isLoading?: boolean;
};
const SurahPreviewRow = ({
  surahName,
  surahNumber,
  translatedSurahName,
  description,
  chapterId,
  isMinimalLayout = false,
  isLoading = false,
}: SurahPreviewRowProps) => {
  const { locale } = useRouter();
  const localizedSurahNumber = useMemo(
    () => toLocalizedNumber(surahNumber, locale),
    [surahNumber, locale],
  );

  if (isMinimalLayout) {
    return (
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.surahNumber}>
            <span>{localizedSurahNumber}</span>
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
          <span>{localizedSurahNumber}</span>
        </div>
        <div className={styles.surahNameContainer}>
          <div className={styles.surahName}>{surahName}</div>
          <div className={styles.translatedSurahName}>{translatedSurahName}</div>
        </div>
      </div>
      {isLoading && <Spinner />}
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
