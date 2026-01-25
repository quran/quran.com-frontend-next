import React from 'react';

import QiraahCard from './QiraahCard';
import styles from './QiraahCardList.module.scss';

import { QiraatReading, QiraatReader, QiraatTransmitter } from '@/types/Qiraat';

interface QiraahCardListProps {
  readings: QiraatReading[];
  readers: QiraatReader[];
  transmitters: QiraatTransmitter[];
}

/**
 * Renders a vertical list of QiraahCard components.
 * Each card has an ID for scroll targeting from Rwayah tags.
 * @returns {JSX.Element} Rendered QiraahCardList component
 */
const QiraahCardList: React.FC<QiraahCardListProps> = ({ readings, readers, transmitters }) => {
  if (!readings || readings.length === 0) return null;

  return (
    <div className={styles.list}>
      {readings.map((reading) => (
        <QiraahCard
          key={reading.id}
          id={`qiraah-card-${reading.id}`}
          reading={reading}
          readers={readers}
          transmitters={transmitters}
        />
      ))}
    </div>
  );
};

export default QiraahCardList;
