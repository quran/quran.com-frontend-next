import { QiraatReading } from '@/types/Qiraat';

export const DEFAULT_READER_COLOR = '#FFFFFF';

/**
 * Color for a transmitter tag based on its association with a reading.
 *
 * Transmitter tags are color-coded like the reading cards. Association is
 * resolved in four steps:
 * 1. Direct match: a reading listing this transmitter in its matrix.
 * 2. Inherited match: a reading listing this transmitter's parent reader.
 * 3. Cell match: a reading whose matrix *cells* reference the transmitter
 *    (or, failing that, the parent reader). Some readings only associate
 *    participants at cell granularity, so steps 1-2 alone leave their tags
 *    white while the cards show color.
 * 4. Fallback: white (no association found).
 *
 * Later steps never override earlier ones.
 *
 * @param {number} transmitterId the transmitter shown in the tag
 * @param {number} readerId the transmitter's parent reader
 * @param {QiraatReading[]} readings the selected juncture's readings
 * @returns {string} the hex color code for the tag
 */
export const getTransmitterColor = (
  transmitterId: number,
  readerId: number,
  readings: QiraatReading[],
): string => {
  const directReading = readings.find(({ matrix }) =>
    matrix?.transmitters?.includes(transmitterId),
  );
  if (directReading) return directReading.color || DEFAULT_READER_COLOR;

  const readerReading = readings.find(({ matrix }) => matrix?.readers?.includes(readerId));
  if (readerReading) return readerReading.color || DEFAULT_READER_COLOR;

  const cellReading = readings.find(({ matrix }) =>
    matrix?.cells?.some((cell) => cell.transmitterId === transmitterId),
  );
  if (cellReading) return cellReading.color || DEFAULT_READER_COLOR;

  const readerCellReading = readings.find(({ matrix }) =>
    matrix?.cells?.some((cell) => cell.readerId === readerId),
  );
  if (readerCellReading) return readerCellReading.color || DEFAULT_READER_COLOR;

  return DEFAULT_READER_COLOR;
};
