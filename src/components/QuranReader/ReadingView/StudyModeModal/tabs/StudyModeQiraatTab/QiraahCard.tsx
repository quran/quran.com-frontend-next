import React, { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './QiraahCard.module.scss';

import { QiraatReading, QiraatReader, QiraatTransmitter } from '@/types/Qiraat';

interface QiraahCardProps {
  reading: QiraatReading;
  readers: QiraatReader[];
  transmitters: QiraatTransmitter[];
  id?: string;
}

/**
 * Display a single reading variant with Arabic text, transliteration,
 * translation, explanation, and reader attribution.
 */
const QiraahCard: React.FC<QiraahCardProps> = ({ reading, readers, transmitters, id }) => {
  const { t } = useTranslation('common');

  // Get reader names for attribution based on matrix
  const readerNames = useMemo(() => {
    const readerIds = reading.matrix?.readers || [];
    const transmitterIds = reading.matrix?.transmitters || [];

    // Collect names from both readers and transmitters in the matrix
    const names: string[] = [];

    // Add reader names
    readerIds.forEach((readerId) => {
      const reader = readers.find((r) => r.id === readerId);
      if (reader) {
        names.push(reader.abbreviation || reader.name);
      }
    });

    // Add transmitter names (for cases where only transmitter is specified)
    transmitterIds.forEach((transmitterId) => {
      const transmitter = transmitters.find((tr) => tr.id === transmitterId);
      if (transmitter) {
        // Find parent reader for context if needed
        const parentReader = readers.find((r) => r.id === transmitter.readerId);
        const transmitterName = transmitter.abbreviation || transmitter.name;
        if (parentReader && !names.includes(parentReader.abbreviation || parentReader.name)) {
          names.push(`${transmitterName} (${parentReader.abbreviation})`);
        } else {
          names.push(transmitterName);
        }
      }
    });

    return names;
  }, [reading.matrix, readers, transmitters]);

  // Get the primary explanation text
  const explanationText = useMemo(() => {
    if (reading.explanation?.text) {
      return reading.explanation.text;
    }
    if (reading.explanations && reading.explanations.length > 0) {
      return reading.explanations[0].text;
    }
    return null;
  }, [reading.explanation, reading.explanations]);

  // Get the primary translation text
  const translationText = useMemo(() => {
    if (reading.translation) {
      return reading.translation;
    }
    if (reading.translations && reading.translations.length > 0) {
      return reading.translations[0].text;
    }
    return null;
  }, [reading.translation, reading.translations]);

  return (
    <div
      id={id}
      className={styles.card}
      style={{ '--card-color': reading.color || '#FFFFFF' } as React.CSSProperties}
    >
      <div className={styles.colorBar} />
      <div className={styles.content}>
        {/* Arabic text */}
        <div className={styles.arabicSection}>
          <span className={styles.arabicText}>{reading.textUthmani || reading.text}</span>
        </div>

        {/* Transliteration */}
        {reading.transliteration && (
          <div className={styles.transliterationSection}>
            <span className={styles.transliteration}>{reading.transliteration}</span>
          </div>
        )}

        {/* Translation */}
        {translationText && (
          <div className={styles.translationSection}>
            <span className={styles.translationLabel}>{t('qiraat.translation')}:</span>
            <span className={styles.translation}>&quot;{translationText}&quot;</span>
          </div>
        )}

        {/* Explanation */}
        {explanationText && (
          <div className={styles.explanationSection}>
            <span className={styles.explanationLabel}>{t('qiraat.explanation')}:</span>
            <span className={styles.explanation}>{explanationText}</span>
          </div>
        )}

        {/* Reader attribution */}
        {readerNames.length > 0 && (
          <div className={styles.readersSection}>
            <span className={styles.readersLabel}>{t('qiraat.readers')}:</span>
            <span className={styles.readersList}>{readerNames.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QiraahCard;
