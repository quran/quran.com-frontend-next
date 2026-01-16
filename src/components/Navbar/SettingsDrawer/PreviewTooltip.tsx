import React from 'react';

import { useSelector } from 'react-redux';

import styles from './PreviewTooltip.module.scss';

import { selectTooltipContentType } from '@/redux/slices/QuranReader/readingPreferences';
import { WordByWordType } from '@/types/QuranReader';
import { areArraysEqual } from '@/utils/array';
import Word from 'types/Word';

type PreviewTooltipProps = {
  word: Word;
  left?: number; // Distance from left edge of container in pixels
  isVisible?: boolean; // Hide until position calculated
};

/**
 * A static tooltip component that mimics the real tooltip's appearance
 * but is part of the normal DOM flow (not portalled).
 * Position is calculated dynamically based on the highlighted word's location.
 * This prevents scroll positioning issues in the settings preview.
 */
const PreviewTooltip = ({ word, left, isVisible = true }: PreviewTooltipProps) => {
  const showTooltipFor = useSelector(selectTooltipContentType, areArraysEqual) as WordByWordType[];

  if (!showTooltipFor.length) {
    return null;
  }

  const positionStyle: React.CSSProperties = {
    left: left !== undefined ? `${left}px` : '50%',
    opacity: isVisible ? 1 : 0,
  };

  return (
    <div className={styles.container} style={positionStyle}>
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
