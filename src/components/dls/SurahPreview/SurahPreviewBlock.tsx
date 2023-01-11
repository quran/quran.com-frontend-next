import { useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import styles from './SurahPreviewBlock.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';

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
  const { locale } = useRouter();
  const isMinimalLayout = shouldUseMinimalLayout(locale);
  const localizedSurahNumber = useMemo(() => {
    return toLocalizedNumber(surahNumber, locale);
  }, [locale, surahNumber]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <div className={styles.translatedSurahName}>
            {isMinimalLayout && <>{t('surah')} </>}
            {translatedSurahName}
          </div>
          {!isMinimalLayout && (
            <div className={styles.surahName}>
              {t('surah')} <br />
              {surahName}
            </div>
          )}
        </div>
        <div className={styles.surahNumber}>{localizedSurahNumber}</div>
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
