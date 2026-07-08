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
 * Assigns every unambiguous tag (exactly one candidate reading) and records its
 * color as represented in the panel. Tags with no candidate fall back to the
 * default (white) color and a null reading id.
 *
 * @param {TransmitterCandidates[]} tags - Transmitter tags with their candidates
 * @param {Map<number, TransmitterReadingAssignment>} assignments - Mutated in place
 * @param {Set<string>} representedColors - Mutated in place with claimed colors
 * @returns {void}
 */
const assignUnambiguousTags = (
  tags: TransmitterCandidates[],
  assignments: Map<number, TransmitterReadingAssignment>,
  representedColors: Set<string>,
): void => {
  tags.forEach(({ transmitterId, candidates }) => {
    if (candidates.length === 0) {
      assignments.set(transmitterId, { readingId: null, color: DEFAULT_READING_COLOR });
    } else if (candidates.length === 1) {
      assignments.set(transmitterId, toAssignment(candidates[0]));
      representedColors.add(normalizeColor(candidates[0].color));
    }
  });
};

/**
 * Assigns every ambiguous tag (two or more candidate readings) in two sub-passes:
 *
 * - 2a: each ambiguous tag claims the first candidate color the panel does not show
 *   yet, marking it represented. Marking as we go means that when several colors are
 *   reachable only through ambiguous tags, each still-missing color gets covered by a
 *   different tag instead of every tag piling onto the same first one.
 * - 2b: tags whose candidate colors are all represented reuse a color already chosen
 *   by another ambiguous tag (keeping sibling transmitters grouped — e.g. both
 *   Abū Jaʿfar and Ibn Kathīr on pink for 2:245, since pink was the only missing
 *   color there), falling back to the first candidate otherwise.
 *
 * @param {TransmitterCandidates[]} tags - Transmitter tags with their candidates
 * @param {Map<number, TransmitterReadingAssignment>} assignments - Mutated in place
 * @param {Set<string>} representedColors - Colors already claimed in pass 1
 * @returns {void}
 */
const assignAmbiguousTags = (
  tags: TransmitterCandidates[],
  assignments: Map<number, TransmitterReadingAssignment>,
  representedColors: Set<string>,
): void => {
  const deferred: TransmitterCandidates[] = [];
  const ambiguousColors = new Set<string>();

  tags.forEach((tag) => {
    if (tag.candidates.length < 2) return;
    const unrepresented = tag.candidates.find(
      (reading) => !representedColors.has(normalizeColor(reading.color)),
    );
    if (!unrepresented) {
      deferred.push(tag);
      return;
    }
    assignments.set(tag.transmitterId, toAssignment(unrepresented));
    representedColors.add(normalizeColor(unrepresented.color));
    ambiguousColors.add(normalizeColor(unrepresented.color));
  });

  deferred.forEach(({ transmitterId, candidates }) => {
    const sibling = candidates.find((reading) =>
      ambiguousColors.has(normalizeColor(reading.color)),
    );
    assignments.set(transmitterId, toAssignment(sibling ?? candidates[0]));
  });
};

/**
 * Builds the reading assignment (reading id + color) for every transmitter tag
 * shown in the Readers panel.
 *
 * Some payloads list the same reader in multiple readings without
 * transmitter-level disambiguation (e.g. 2:245, where Abū Jaʿfar and Ibn Kathīr
 * appear in both the default and the pink readings). A naive first-match lookup
 * always resolves such readers to the earliest reading, so the later reading's
 * color disappears from the panel entirely (#3286). Unambiguous tags are assigned
 * first so their colors anchor the panel, then ambiguous tags are distributed to
 * surface every still-missing reading color.
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

  assignUnambiguousTags(tags, assignments, representedColors);
  assignAmbiguousTags(tags, assignments, representedColors);

  return assignments;
};
