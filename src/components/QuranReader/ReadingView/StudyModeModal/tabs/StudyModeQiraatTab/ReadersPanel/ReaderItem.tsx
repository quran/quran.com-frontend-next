import React from 'react';

import {
  DEFAULT_READING_COLOR,
  TransmitterReadingAssignment,
} from '../utils/transmitterReadingAssignments';

import styles from './ReaderItem.module.scss';
import RwayahTag from './RwayahTag';

import HelpCircleIcon from '@/icons/help-circle.svg';
import { QiraatReader, QiraatTransmitter } from '@/types/Qiraat';

interface ReaderItemProps {
  reader: QiraatReader;
  transmitters: QiraatTransmitter[];
  transmitterAssignments: Map<number, TransmitterReadingAssignment>;
  onInfoClick?: () => void;
  onTransmitterClick?: (transmitterId: number) => void;
  isClickable?: boolean;
}

/**
 * Display a single reader with their city and two transmitters (Rwayat).
 * Each transmitter tag is color-coded based on the reading assignment computed
 * for the whole panel (see buildTransmitterReadingAssignments), so overlapping
 * reader-level mappings still surface every reading color.
 * @returns {JSX.Element} Rendered ReaderItem component
 */
const ReaderItem: React.FC<ReaderItemProps> = ({
  reader,
  transmitters,
  transmitterAssignments,
  onInfoClick,
  onTransmitterClick,
  isClickable = false,
}) => {
  // Get transmitters for this reader (should be 2 based on spec)
  const readerTransmitters = transmitters.filter((t) => t.readerId === reader.id);

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
            color={transmitterAssignments.get(transmitter.id)?.color ?? DEFAULT_READING_COLOR}
            onClick={() => onTransmitterClick?.(transmitter.id)}
            isClickable={isClickable}
          />
        ))}
      </div>
    </div>
  );
};

export default ReaderItem;
