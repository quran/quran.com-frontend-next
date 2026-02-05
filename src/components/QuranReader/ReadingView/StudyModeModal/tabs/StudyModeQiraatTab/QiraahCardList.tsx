import React, { useMemo } from 'react';

import QiraahCard, { QiraahReading } from './QiraahCard';
import cardStyles from './QiraahCard.module.scss';
import styles from './QiraahCardList.module.scss';

import { getColorClass } from '@/components/QuranReader/ReadingView/StudyModeModal/tabs/StudyModeQiraatTab/utils/color';
import { QiraatReading } from '@/types/Qiraat';

interface QiraahCardListProps {
  readings: QiraatReading[];
}

/**
 * Renders a vertical list of QiraahCard components.
 * Each card has an ID for scroll targeting from Rwayah tags.
 * @returns {JSX.Element} Rendered QiraahCardList component
 */
const QiraahCardList: React.FC<QiraahCardListProps> = ({ readings }) => {
  const normalizedReadings = useMemo(
    () =>
      (readings ?? []).map((reading) => {
        const explanationText =
          reading.explanation?.text ?? reading.explanations?.[0]?.text ?? null;
        const translationText = reading.translation ?? reading.translations?.[0]?.text ?? null;

        const arabicText = reading.textUthmani || reading.text;
        const transliterationText = reading.transliteration;
        const colorClass = getColorClass(reading.color);

        return {
          id: reading.id.toString(),
          explanation: explanationText,
          translation: translationText,
          arabic: arabicText,
          transliteration: transliterationText,
          color: colorClass,
        };
      }),
    [readings],
  );

  // Group readings by explanation and translation
  const groupedReadings = useMemo(() => {
    const groups: Record<string, { readings: Array<QiraahReading> } & Partial<QiraahReading>> = {};

    normalizedReadings.forEach((reading) => {
      const key = `exp:${reading.explanation ?? ''}-trans:${reading.translation ?? ''}`;

      if (!groups[key]) {
        groups[key] = {
          explanation: reading.explanation,
          translation: reading.translation,
          readings: [],
        };
      }

      groups[key].readings.push({
        id: reading.id.toString(),
        arabic: reading.arabic,
        transliteration: reading.transliteration,
        color: reading.color,
      });
    });

    return Object.values(groups).map(({ readings: r, explanation, translation }) =>
      r.length === 1
        ? { ...r[0], explanation, translation }
        : { explanation, translation, readings: r },
    ) as Array<{ readings: Array<QiraahReading> } & QiraahReading>;
  }, [normalizedReadings]);

  return (
    <div className={styles.list}>
      {groupedReadings.map((readingGroup) =>
        Array.isArray(readingGroup.readings) ? (
          <div
            className={styles.readingGroup}
            key={readingGroup.readings.map((reading) => reading.id).join('~')}
          >
            <div className={styles.cards}>
              {readingGroup.readings.map((reading) => (
                <QiraahCard key={reading.id} {...reading} />
              ))}
            </div>

            {readingGroup.translation && (
              <div className={cardStyles.translation}>{readingGroup.translation}</div>
            )}

            {readingGroup.explanation && readingGroup.translation && (
              <div className={cardStyles.separator} />
            )}

            {readingGroup.explanation && (
              <div className={cardStyles.explanation}>{readingGroup.explanation}</div>
            )}
          </div>
        ) : (
          <QiraahCard key={readingGroup?.id?.toString() ?? ''} {...readingGroup} />
        ),
      )}
    </div>
  );
};

export default QiraahCardList;
