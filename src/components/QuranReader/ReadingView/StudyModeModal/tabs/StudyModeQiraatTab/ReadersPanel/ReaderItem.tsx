import React from 'react';

import styles from './ReaderItem.module.scss';
import RwayahTag from './RwayahTag';

import HelpCircleIcon from '@/icons/help-circle.svg';
import { QiraatReader, QiraatTransmitter, QiraatReading } from '@/types/Qiraat';

interface ReaderItemProps {
  reader: QiraatReader;
  transmitters: QiraatTransmitter[];
  readings: QiraatReading[];
  onInfoClick?: () => void;
  onTransmitterClick?: (transmitterId: number) => void;
  isClickable?: boolean;
}

const DEFAULT_COLOR = '#FFFFFF';

/**
 * Display a single reader with their city and two transmitters (Rwayat).
 * Each transmitter tag is color-coded based on the reading they're associated with.
 * @returns {JSX.Element} Rendered ReaderItem component
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

  const getTransmitterColor = (transmitterId: number): string => {
    const reading = readings.find(
      (r) =>
        r.matrix?.transmitters?.includes(transmitterId) || r.matrix?.readers?.includes(reader.id),
    );

    return reading?.color || DEFAULT_COLOR;
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
              <HelpCircleIcon className={styles.infoIcon} />
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
