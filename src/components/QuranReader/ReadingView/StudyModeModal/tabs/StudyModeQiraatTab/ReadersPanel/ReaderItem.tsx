import React from 'react';

import styles from './ReaderItem.module.scss';
import RwayahTag from './RwayahTag';
import { getTransmitterColor } from '../utils/transmitterColor';

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

/**
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

  const getColor = (transmitterId: number): string =>
    getTransmitterColor(transmitterId, reader.id, readings);

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <div className={styles.nameContainer}>
          <span className={styles.name}>{reader.translatedName ?? reader.abbreviation}</span>
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
            color={getColor(transmitter.id)}
            onClick={() => onTransmitterClick?.(transmitter.id)}
            isClickable={isClickable}
          />
        ))}
      </div>
    </div>
  );
};

export default ReaderItem;
