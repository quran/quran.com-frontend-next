import React, { useMemo } from 'react';

import classNames from 'classnames';

import colorStyles from './color.module.scss';
import styles from './QiraahCard.module.scss';
import { getColorClass } from './utils/color';

import { QiraatReading } from '@/types/Qiraat';

interface QiraahCardProps {
  reading: QiraatReading;
  id?: string;
}

/**
 * Display a single reading variant with Arabic text, transliteration,
 * translation, explanation, and reader attribution.
 *
 * @returns {JSX.Element} Rendered QiraahCard component
 */
const QiraahCard: React.FC<QiraahCardProps> = ({ reading, id }) => {
  const explanationText = useMemo(() => {
    if (reading.explanation?.text) {
      return reading.explanation.text;
    }

    if (reading.explanations && reading.explanations.length > 0) {
      return reading.explanations[0].text;
    }

    return null;
  }, [reading.explanation, reading.explanations]);

  const translationText = useMemo(() => {
    if (reading.translation) {
      return reading.translation;
    }

    if (reading.translations && reading.translations.length > 0) {
      return reading.translations[0].text;
    }

    return null;
  }, [reading.translation, reading.translations]);

  const arabicText = reading.textUthmani || reading.text;
  const transliterationText = reading.transliteration;
  const colorClass = getColorClass(reading.color);

  return (
    <div id={id} className={classNames(styles.card, colorStyles[colorClass])}>
      <div className={styles.arabicText} dir="auto">
        {arabicText}
      </div>

      {transliterationText && <div className={styles.transliteration}>{transliterationText}</div>}
      {translationText && <div className={styles.translation}>{translationText}</div>}
      {explanationText && <div className={styles.separator} />}
      {explanationText && <div className={styles.explanation}>{explanationText}</div>}
    </div>
  );
};

export default QiraahCard;
