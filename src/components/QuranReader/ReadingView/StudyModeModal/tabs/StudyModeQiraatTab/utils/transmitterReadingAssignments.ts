import { QiraatReader, QiraatReading, QiraatTransmitter } from '@/types/Qiraat';

export const DEFAULT_READING_COLOR = '#FFFFFF';

export interface TransmitterReadingAssignment {
  readingId: number | null;
  color: string;
}

interface TransmitterCandidates {
  transmitterId: number;
  candidates: QiraatReading[];
}

const normalizeColor = (color: string | null | undefined): string =>
  (color || DEFAULT_READING_COLOR).toLowerCase();

const toAssignment = (reading: QiraatReading): TransmitterReadingAssignment => ({
  readingId: reading.id,
  color: reading.color || DEFAULT_READING_COLOR,
});

/**
 * Collects the candidate readings a transmitter tag could be associated with.
 *
 * Readings expose membership through `matrix.transmitters` (authoritative when
 * populated) and `matrix.readers` (fallback used when the payload carries no
 * transmitter-level data for this transmitter).
 *
 * @param {number} transmitterId - The transmitter to collect candidates for
 * @param {number} readerId - The transmitter's parent reader
 * @param {QiraatReading[]} readings - Readings of the selected juncture
 * @returns {QiraatReading[]} Candidate readings, in reading order
 */
const getCandidateReadings = (
  transmitterId: number,
  readerId: number,
  readings: QiraatReading[],
): QiraatReading[] => {
  const directMatches = readings.filter((reading) =>
    reading.matrix?.transmitters?.includes(transmitterId),
  );
  if (directMatches.length > 0) return directMatches;

  return readings.filter((reading) => reading.matrix?.readers?.includes(readerId));
};

/**
 * Pairs every transmitter tag shown in the panel with its candidate readings.
 *
 * @param {QiraatReader[]} readers - All canonical readers
 * @param {QiraatTransmitter[]} transmitters - All transmitters
 * @param {QiraatReading[]} readings - Readings of the selected juncture
 * @returns {TransmitterCandidates[]} One entry per transmitter tag
 */
const collectTagCandidates = (
  readers: QiraatReader[],
  transmitters: QiraatTransmitter[],
  readings: QiraatReading[],
): TransmitterCandidates[] =>
  readers.flatMap((reader) =>
    transmitters
      .filter((transmitter) => transmitter.readerId === reader.id)
      .map((transmitter) => ({
        transmitterId: transmitter.id,
        candidates: getCandidateReadings(transmitter.id, reader.id, readings),
      })),
  );

/**
 * Builds the reading assignment (reading id + color) for every transmitter tag
 * shown in the Readers panel.
 *
 * Some payloads list the same reader in multiple readings without
 * transmitter-level disambiguation (e.g. 2:245, where Abū Jaʿfar and Ibn Kathīr
 * appear in both the default and the pink readings). A naive first-match lookup
 * always resolves such readers to the earliest reading, so the later reading's
 * color disappears from the panel entirely (#3286).
 *
 * Assignment strategy:
 * 1. Unambiguous tags (exactly one candidate reading) are assigned first and
 *    their colors are recorded as represented in the panel.
 * 2. Ambiguous tags (two or more candidates) take the first candidate whose
 *    color is not yet represented, falling back to the first candidate when
 *    every candidate color is already represented (the previous behavior).
 * 3. Tags with no candidates fall back to the default (white) color.
 *
 * @param {QiraatReader[]} readers - All canonical readers
 * @param {QiraatTransmitter[]} transmitters - All transmitters
 * @param {QiraatReading[]} readings - Readings of the selected juncture
 * @returns {Map<number, TransmitterReadingAssignment>} Assignment per transmitter id
 */
export const buildTransmitterReadingAssignments = (
  readers: QiraatReader[],
  transmitters: QiraatTransmitter[],
  readings: QiraatReading[],
): Map<number, TransmitterReadingAssignment> => {
  const tags = collectTagCandidates(readers, transmitters, readings);
  const assignments = new Map<number, TransmitterReadingAssignment>();
  const representedColors = new Set<string>();

  // Pass 1 — unambiguous tags claim their reading and mark its color as represented
  tags.forEach(({ transmitterId, candidates }) => {
    if (candidates.length === 0) {
      assignments.set(transmitterId, { readingId: null, color: DEFAULT_READING_COLOR });
    } else if (candidates.length === 1) {
      assignments.set(transmitterId, toAssignment(candidates[0]));
      representedColors.add(normalizeColor(candidates[0].color));
    }
  });

  // Pass 2 — ambiguous tags prefer the first candidate color the panel doesn't show yet
  tags.forEach(({ transmitterId, candidates }) => {
    if (candidates.length < 2) return;
    const unrepresented = candidates.find(
      (reading) => !representedColors.has(normalizeColor(reading.color)),
    );
    assignments.set(transmitterId, toAssignment(unrepresented ?? candidates[0]));
  });

  return assignments;
};
