import React, { useCallback, useContext, useMemo } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './RecentlySaved.module.scss';

import DataContext from '@/contexts/DataContext';
import { RecentlySavedItem } from '@/hooks/useRecentlySaved';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';

export interface RecentlySavedProps {
  items: RecentlySavedItem[];
  isLoading: boolean;
}

const RecentlySaved: React.FC<RecentlySavedProps> = ({ items, isLoading }) => {
  const { t, lang } = useTranslation('my-quran');
  const router = useRouter();
  const chaptersData = useContext(DataContext);

  const isArabicOrUrdu = lang === 'ar' || lang === 'ur';

  const handleItemClick = useCallback(
    (item: RecentlySavedItem) => {
      router.push(getVerseNavigationUrlByVerseKey(item.verseKey));
    },
    [router],
  );

  const itemsWithNames = useMemo(() => {
    if (!chaptersData) return [];

    return items
      .map((item) => {
        const chapterData = getChapterData(chaptersData, item.surahNumber.toString());
        if (!chapterData) return null;

        const surahName = isArabicOrUrdu
          ? chapterData.translatedName
          : chapterData.transliteratedName;
        const surahNum = toLocalizedNumber(item.surahNumber, lang);
        const ayahNum = toLocalizedNumber(item.ayahNumber, lang);

        return {
          ...item,
          displayText: `${surahName} ${surahNum}:${ayahNum}`,
        };
      })
      .filter(Boolean);
  }, [items, chaptersData, isArabicOrUrdu, lang]);

  // Don't render if no items (component should be hidden by parent)
  if (!isLoading && items.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{t('recently-saved.title')}</h3>
        <div className={styles.scrollContainer}>
          <div className={styles.itemsList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t('recently-saved.title')}</h3>
      <div className={styles.scrollContainer}>
        <div className={styles.itemsList}>
          {itemsWithNames.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.item}
              onClick={() => handleItemClick(item)}
            >
              <span className={styles.itemText}>{item.displayText}</span>
              <ChevronRightIcon className={styles.itemArrow} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlySaved;
