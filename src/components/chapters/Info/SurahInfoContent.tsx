import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './SurahInfoModal.module.scss';

import ChapterIconContainer, {
  ChapterIconsSize,
} from '@/components/chapters/ChapterIcon/ChapterIconContainer';
import Chapter from '@/types/Chapter';
import ChapterInfo from '@/types/ChapterInfo';
import { shouldUseMinimalLayout, toLocalizedNumber } from '@/utils/locale';

interface SurahInfoContentProps {
  chapterId: string;
  chapterInfo: ChapterInfo;
  chapter: Chapter;
}

const SurahInfoContent: React.FC<SurahInfoContentProps> = ({ chapterId, chapterInfo, chapter }) => {
  const { t, lang } = useTranslation();
  const shouldHideTransliteration = shouldUseMinimalLayout(lang);

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.calligraphyContainer}>
          <ChapterIconContainer
            chapterId={chapterId}
            size={ChapterIconsSize.XMega}
            hasSurahPrefix={false}
          />
        </div>

        {!shouldHideTransliteration && (
          <h2 className={styles.surahName} data-testid="surah-name">
            {t('common:surah')} {chapter.transliteratedName}
          </h2>
        )}

        <div className={styles.detailsContainer}>
          <div className={styles.detailItem}>
            <p className={styles.detailHeader}>{t('common:ayahs')}:</p>
            <p data-testid="surah-number-of-ayahs">
              {toLocalizedNumber(chapter.versesCount, lang)}
            </p>
          </div>
          <div className={styles.detailItem}>
            <p className={styles.detailHeader}>{t('surah-info:revelation-place')}:</p>
            <p data-testid="surah-revelation-place">{t(`surah-info:${chapter.revelationPlace}`)}</p>
          </div>
        </div>
      </div>

      <div
        className={styles.descriptionContainer}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: chapterInfo.text }}
      />
    </>
  );
};

export default SurahInfoContent;
