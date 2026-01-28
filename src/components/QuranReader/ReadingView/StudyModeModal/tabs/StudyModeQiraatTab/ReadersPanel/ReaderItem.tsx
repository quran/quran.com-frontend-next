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

  /**
   * Determines the color for a transmitter tag based on its association with a reading.
   *
   * Qiraat readings have colored matrix displays that show which transmitters and readers
   * are part of that reading. When displaying a transmitter in the Readers panel, we need
   * to find which reading it belongs to so we can color-code it appropriately.
   *
   * Two-step lookup process:
   * 1. Direct match: Try to find a reading where this transmitter appears in the matrix
   * 2. Inherited match: If not found directly, look for a reading where the transmitter's
   *    parent reader appears (transmitters inherit their reader's color association)
   * 3. Fallback: Return white if no association found
   *
   * @param {number} transmitterId - The ID of the transmitter to find a color for
   * @returns {string} The hex color code for the transmitter's associated reading
   */
  const getTransmitterColor = (transmitterId: number): string => {
    // 1. Find a reading where this transmitter appears directly in the matrix
    const transmitterReading = readings.find(({ matrix }) =>
      matrix?.transmitters?.includes(transmitterId),
    );

    if (transmitterReading) return transmitterReading.color || DEFAULT_COLOR;

    // 2. If not found directly, the transmitter inherits color from its parent reader
    // Find a reading where this reader appears in the matrix
    const readerReading = readings.find(({ matrix }) => matrix?.readers?.includes(reader.id));
    if (readerReading) return readerReading.color || DEFAULT_COLOR;

    // 3. Default fallback - no association found
    return DEFAULT_COLOR;
  };

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
