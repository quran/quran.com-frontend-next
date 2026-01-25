import React from 'react';

import QiraahCard from './QiraahCard';
import styles from './QiraahCardList.module.scss';

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
  if (!readings || readings.length === 0) return null;

  const groupedReadings = readings as (QiraatReading | QiraatReading[])[];

  return (
    <div className={styles.list}>
      {groupedReadings.map((readingGroup) =>
        Array.isArray(readingGroup) ? (
          <div
            className={styles.readingGroup}
            key={readingGroup.map((reading) => reading.id).join(',')}
          >
            {readingGroup.map((reading) => (
              <QiraahCard key={reading.id} id={`qiraah-card-${reading.id}`} reading={reading} />
            ))}
          </div>
        ) : (
          <QiraahCard
            key={readingGroup.id}
            id={`qiraah-card-${readingGroup.id}`}
            reading={readingGroup}
          />
        ),
      )}
    </div>
  );
};

export default QiraahCardList;
