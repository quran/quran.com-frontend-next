import React from 'react';

import { useSelector } from 'react-redux';

import styles from './PreviewTooltip.module.scss';

import { selectTooltipContentType } from '@/redux/slices/QuranReader/readingPreferences';
import { WordByWordType } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import Word from 'types/Word';

type PreviewTooltipProps = {
  word: Word;
  leftPosition: number;
  isVisible: boolean;
};

/**
 * A static tooltip that mimics the real tooltip appearance.
 * Positioned absolutely based on the highlighted word's location.
 * Not portalled, so it scrolls with the settings drawer content.
 *
 * @returns {JSX.Element | null} The tooltip or null if no content types selected
 */
const PreviewTooltip = ({ word, leftPosition, isVisible }: PreviewTooltipProps) => {
  const showTooltipFor = useSelector(selectTooltipContentType, areArraysEqual) as WordByWordType[];

  if (!showTooltipFor.length) {
    return null;
  }

  return (
    <div
      className={styles.container}
      style={{
        left: `${leftPosition}px`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className={styles.tooltip}>
        {showTooltipFor.map((tooltipTextType) => (
          <p key={tooltipTextType} className={styles.tooltipText}>
            {word[tooltipTextType]?.text}
          </p>
        ))}
      </div>
      <div className={styles.arrow} />
    </div>
  );
};

export default PreviewTooltip;
