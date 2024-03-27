import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SurahPreviewBlock.module.scss';

import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';

type SurahPreviewBlockProps = {
  surahNumber: number;
  surahName: string;
  translatedSurahName: string;
  chapterId: number;
  description?: string;
};

const SurahPreviewBlock = ({
  surahName,
  surahNumber,
  translatedSurahName,
}: SurahPreviewBlockProps) => {
  const { t, lang } = useTranslation('common');
  const isMinimalLayout = shouldUseMinimalLayout(lang);
  const localizedSurahNumber = useMemo(() => {
    return toLocalizedNumber(surahNumber, lang);
  }, [lang, surahNumber]);
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
    </div>
  );
};

export default SurahPreviewBlock;
