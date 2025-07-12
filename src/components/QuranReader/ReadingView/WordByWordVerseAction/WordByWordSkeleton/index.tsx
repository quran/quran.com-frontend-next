import React from 'react';

import range from 'lodash/range';

import styles from './WordByWordSkeleton.module.scss';

import Separator from '@/components/dls/Separator/Separator';
import Skeleton from '@/components/dls/Skeleton/Skeleton';

const WordByWordSkeleton: React.FC = () => {
  // Number of words to show in each section
  const wordsCount = 9; // Showing 9 words like in the example

  // Create a word item with Arabic text and translation/transliteration
  const renderWordItem = (key: string) => (
    <div key={key} className={styles.wordItem}>
      <Skeleton className={styles.arabicWord} />
      <Skeleton className={styles.translation} />
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Translation Section */}
      <div className={styles.headingContainer}>
        <Skeleton className={styles.headingContainer} />
      </div>
      <div className={styles.wordGroup}>
        {range(0, wordsCount).map((index) => renderWordItem(`translation-${index}`))}
      </div>

      <Separator className={styles.separator} />

      {/* Transliteration Section */}
      <div className={styles.headingContainer}>
        <Skeleton className={styles.headingContainer} />
      </div>
      <div className={styles.wordGroup}>
        {range(0, wordsCount).map((index) => renderWordItem(`transliteration-${index}`))}
      </div>
    </div>
  );
};

export default WordByWordSkeleton;
