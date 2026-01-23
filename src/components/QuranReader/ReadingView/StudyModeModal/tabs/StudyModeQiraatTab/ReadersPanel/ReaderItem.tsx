import React from 'react';

import RwayahTag from './RwayahTag';
import styles from './ReaderItem.module.scss';

import { QiraatReader, QiraatTransmitter, QiraatReading } from '@/types/Qiraat';
import InfoIcon from '@/icons/info.svg';

interface ReaderItemProps {
  reader: QiraatReader;
  transmitters: QiraatTransmitter[];
  readings: QiraatReading[];
  onInfoClick?: () => void;
  onTransmitterClick?: (transmitterId: number) => void;
  isClickable?: boolean;
}

/**
 * Display a single reader with their city and two transmitters (Rwayat).
 * Each transmitter tag is color-coded based on the reading they're associated with.
 */
const ReaderItem: React.FC<ReaderItemProps> = ({
  reader,
  transmitters,
  readings,
  onInfoClick,
  onTransmitterClick,
  isClickable = false,
}) => {
  // Get transmitters for this reader (should be 2 based on spec)
  const readerTransmitters = transmitters.filter((t) => t.readerId === reader.id);

  // Get the color for a transmitter based on which reading they're associated with
  const getTransmitterColor = (transmitterId: number): string => {
    // Find reading where this transmitter appears in the matrix
    for (const reading of readings) {
      if (reading.matrix?.transmitters?.includes(transmitterId)) {
        return reading.color || '#FFFFFF';
      }
      // Also check if the reader is in the matrix (transmitter might inherit reader's color)
      if (reading.matrix?.readers?.includes(reader.id)) {
        return reading.color || '#FFFFFF';
      }
    }
    // Default fallback
    return '#FFFFFF';
  };

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <div className={styles.nameContainer}>
          <span className={styles.name}>{reader.translatedName || reader.name}</span>
          {reader.bio && (
            <button
              type="button"
              className={styles.infoButton}
              onClick={onInfoClick}
              aria-label={`Info about ${reader.name}`}
            >
              <InfoIcon className={styles.infoIcon} />
            </button>
          )}
        </div>
        {reader.city && <span className={styles.city}>{reader.city}</span>}
      </div>
      <div className={styles.tags}>
        {readerTransmitters.map((transmitter) => (
          <RwayahTag
            key={transmitter.id}
            transmitter={transmitter}
            color={getTransmitterColor(transmitter.id)}
            onClick={() => onTransmitterClick?.(transmitter.id)}
            isClickable={isClickable}
          />
        ))}
      </div>
    </div>
  );
};

export default ReaderItem;
