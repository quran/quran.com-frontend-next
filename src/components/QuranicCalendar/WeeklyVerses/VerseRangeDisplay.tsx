import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './WeeklyVerses.module.scss';

import { toLocalizedNumber, toLocalizedVerseKey } from '@/utils/locale';

interface VerseRangeDisplayProps {
  fromChapter: number;
  fromChapterName: string;
  fromVerse: number;
  rangeFrom: string;
  toChapter: number;
  toChapterName: string;
  toVerse: number;
  rangeTo: string;
}

const VerseRangeDisplay: React.FC<VerseRangeDisplayProps> = ({
  fromChapter,
  fromChapterName,
  fromVerse,
  rangeFrom,
  toChapter,
  toChapterName,
  toVerse,
  rangeTo,
}) => {
  const { t, lang } = useTranslation('quranic-calendar');

  return (
    <div className={styles.verseRangeContainer}>
      <div className={styles.surahInfo}>
        <div className={styles.surahName} translate="no">
          {String(fromChapter).padStart(3, '0')}
        </div>
        <div className={styles.transliteratedName} translate="no">
          {toLocalizedNumber(fromChapter, lang)}. {fromChapterName} {t('verse')}{' '}
          {toLocalizedNumber(fromVerse, lang)} ({toLocalizedVerseKey(rangeFrom, lang)})
        </div>
      </div>
      <span className={styles.rangeSeparator}>-</span>
      <div className={styles.surahInfo}>
        <div className={styles.surahName} translate="no">
          {String(toChapter).padStart(3, '0')}
        </div>
        <div className={styles.transliteratedName} translate="no">
          {toLocalizedNumber(toChapter, lang)}. {toChapterName} {t('verse')}{' '}
          {toLocalizedNumber(toVerse, lang)} ({toLocalizedVerseKey(rangeTo, lang)})
        </div>
      </div>
    </div>
  );
};

export default VerseRangeDisplay;
