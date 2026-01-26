import React, { useCallback, useContext, useMemo } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './MyReadingBookmark.module.scss';

import DataContext from '@/contexts/DataContext';
import BookmarkIcon from '@/icons/bookmark-star.svg';
import ChevronRightIcon from '@/icons/chevron-right.svg';
import { getChapterData } from '@/utils/chapter';
import { toLocalizedNumber } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';

export interface ReadingBookmarkData {
  type: 'ayah' | 'page';
  surahName?: string;
  surahNameArabic?: string;
  surahNumber?: number;
  ayahNumber?: number;
  pageNumber?: number;
  createdAt?: string;
  verseKey?: string;
}

export interface MyReadingBookmarkProps {
  bookmark: ReadingBookmarkData | null;
  isLoading: boolean;
}

const MyReadingBookmark: React.FC<MyReadingBookmarkProps> = ({ bookmark, isLoading }) => {
  const { t, lang } = useTranslation('my-quran');
  const router = useRouter();
  const chaptersData = useContext(DataContext);

  const isArabicOrUrdu = lang === 'ar' || lang === 'ur';

  const handleClick = useCallback(() => {
    if (!bookmark) return;

    if (bookmark.type === 'ayah' && bookmark.verseKey) {
      router.push(getVerseNavigationUrlByVerseKey(bookmark.verseKey));
    } else if (bookmark.type === 'page' && bookmark.pageNumber) {
      router.push(`/page/${bookmark.pageNumber}`);
    }
  }, [bookmark, router]);

  const displayText = useMemo(() => {
    if (!bookmark || !chaptersData) return null;

    if (bookmark.type === 'ayah' && bookmark.surahNumber && bookmark.ayahNumber) {
      const chapterData = getChapterData(chaptersData, bookmark.surahNumber.toString());
      if (!chapterData) return null;

      const surahName = isArabicOrUrdu
        ? chapterData.translatedName
        : chapterData.transliteratedName;
      const surahNum = toLocalizedNumber(bookmark.surahNumber, lang);
      const ayahNum = toLocalizedNumber(bookmark.ayahNumber, lang);

      return `${surahName} ${surahNum}:${ayahNum}`;
    }

    if (bookmark.type === 'page' && bookmark.pageNumber) {
      const pageNum = toLocalizedNumber(bookmark.pageNumber, lang);
      return `${t('page')} ${pageNum}`;
    }

    return null;
  }, [bookmark, chaptersData, isArabicOrUrdu, lang, t]);

  const dateText = useMemo(() => {
    if (!bookmark?.createdAt) return null;
    return new Date(bookmark.createdAt).toLocaleDateString(lang, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [bookmark?.createdAt, lang]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{t('reading-bookmark.title')}</h3>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!bookmark) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{t('reading-bookmark.title')}</h3>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{t('reading-bookmark.empty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t('reading-bookmark.title')}</h3>
      <button type="button" className={styles.bookmarkCard} onClick={handleClick}>
        <div className={styles.iconWrapper}>
          <BookmarkIcon className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.textContainer}>
            <span className={styles.text}>{displayText}</span>
            {dateText && <span className={styles.date}>{dateText}</span>}
          </div>
          <ChevronRightIcon className={styles.chevron} />
        </div>
      </button>
    </div>
  );
};

export default MyReadingBookmark;
