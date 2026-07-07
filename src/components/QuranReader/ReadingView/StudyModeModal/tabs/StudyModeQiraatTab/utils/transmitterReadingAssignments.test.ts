/* eslint-disable react-func/max-lines-per-function */
import { describe, expect, it } from 'vitest';

import {
  buildTransmitterReadingAssignments,
  DEFAULT_READING_COLOR,
} from './transmitterReadingAssignments';

import { QiraatReader, QiraatReading, QiraatTransmitter } from '@/types/Qiraat';

const makeReader = (id: number, position: number): QiraatReader =>
  ({ id, position, name: `Reader ${id}` } as QiraatReader);

const makeTransmitter = (id: number, readerId: number): QiraatTransmitter =>
  ({ id, readerId, name: `Transmitter ${id}` } as QiraatTransmitter);

const makeReading = (
  id: number,
  color: string | null,
  readerIds: number[],
  transmitterIds: number[] = [],
): QiraatReading =>
  ({
    id,
    color,
    matrix: { readers: readerIds, transmitters: transmitterIds, cells: [] },
  } as unknown as QiraatReading);

const WHITE = '#ffffff';
const PINK = '#ea9999';
const GREEN = '#b7d7a8';
const BLUE = '#a4c2f4';

describe('buildTransmitterReadingAssignments', () => {
  it('resolves overlapping reader-level mappings to unrepresented colors (2:245 shape)', () => {
    // Readers: 5 = ʿĀṣim, 6 = Abū Jaʿfar, 8 = Ibn Kathīr, 1 = Nāfiʿ, 3 = Ibn ʿĀmir
    const readers = [
      makeReader(1, 1),
      makeReader(3, 3),
      makeReader(5, 5),
      makeReader(6, 8),
      makeReader(8, 2),
    ];
    const transmitters = [
      makeTransmitter(11, 1),
      makeTransmitter(12, 1),
      makeTransmitter(31, 3),
      makeTransmitter(32, 3),
      makeTransmitter(51, 5),
      makeTransmitter(52, 5),
      makeTransmitter(61, 6),
      makeTransmitter(62, 6),
      makeTransmitter(81, 8),
      makeTransmitter(82, 8),
    ];
    // White reading lists ʿĀṣim + Ibn Kathīr + Abū Jaʿfar; pink lists only the latter two.
    const readings = [
      makeReading(100, WHITE, [5, 8, 6]),
      makeReading(101, GREEN, [3]),
      makeReading(102, BLUE, [1]),
      makeReading(103, PINK, [8, 6]),
    ];

    const assignments = buildTransmitterReadingAssignments(readers, transmitters, readings);

    // Unambiguous readers keep their only candidate
    expect(assignments.get(51)).toEqual({ readingId: 100, color: WHITE });
    expect(assignments.get(52)).toEqual({ readingId: 100, color: WHITE });
    expect(assignments.get(31)).toEqual({ readingId: 101, color: GREEN });
    expect(assignments.get(11)).toEqual({ readingId: 102, color: BLUE });

    // Ambiguous readers (white + pink candidates) surface the otherwise-hidden pink
    expect(assignments.get(81)).toEqual({ readingId: 103, color: PINK });
    expect(assignments.get(82)).toEqual({ readingId: 103, color: PINK });
    expect(assignments.get(61)).toEqual({ readingId: 103, color: PINK });
    expect(assignments.get(62)).toEqual({ readingId: 103, color: PINK });
  });

  it('keeps direct transmitter matches authoritative over reader-level mappings', () => {
    const readers = [makeReader(1, 1)];
    const transmitters = [makeTransmitter(11, 1), makeTransmitter(12, 1)];
    // Reader-level mapping points at the green reading, but transmitter 12 is
    // explicitly listed in the pink reading's matrix.
    const readings = [makeReading(100, GREEN, [1]), makeReading(101, PINK, [], [12])];

    const assignments = buildTransmitterReadingAssignments(readers, transmitters, readings);

    expect(assignments.get(11)).toEqual({ readingId: 100, color: GREEN });
    expect(assignments.get(12)).toEqual({ readingId: 101, color: PINK });
  });

  it('resolves duplicate transmitter-level mappings the same way (7:165 shape)', () => {
    const readers = [makeReader(1, 1), makeReader(2, 2)];
    const transmitters = [makeTransmitter(11, 1), makeTransmitter(12, 1), makeTransmitter(21, 2)];
    // Transmitter 12 appears in two readings; transmitter 11 unambiguously
    // represents green, so 12 should resolve to the otherwise-hidden pink.
    const readings = [
      makeReading(100, GREEN, [], [11, 12]),
      makeReading(101, PINK, [], [12]),
      makeReading(102, BLUE, [2]),
    ];

    const assignments = buildTransmitterReadingAssignments(readers, transmitters, readings);

    expect(assignments.get(11)).toEqual({ readingId: 100, color: GREEN });
    expect(assignments.get(12)).toEqual({ readingId: 101, color: PINK });
    expect(assignments.get(21)).toEqual({ readingId: 102, color: BLUE });
  });

  it('falls back to first-match order when every candidate color is already represented', () => {
    const readers = [makeReader(1, 1), makeReader(2, 2), makeReader(3, 3)];
    const transmitters = [makeTransmitter(11, 1), makeTransmitter(21, 2), makeTransmitter(31, 3)];
    // Readers 1 and 2 unambiguously represent white and pink; reader 3 is
    // ambiguous between them, so it keeps the previous first-match behavior.
    const readings = [makeReading(100, WHITE, [1, 3]), makeReading(101, PINK, [2, 3])];

    const assignments = buildTransmitterReadingAssignments(readers, transmitters, readings);

    expect(assignments.get(31)).toEqual({ readingId: 100, color: WHITE });
  });

  it('treats null colors as the default color for representation tracking', () => {
    const readers = [makeReader(1, 1), makeReader(2, 2)];
    const transmitters = [makeTransmitter(11, 1), makeTransmitter(21, 2)];
    // The default reading carries a null color; reader 2 is ambiguous between it
    // and pink, and the null color counts as white when tracking representation.
    const readings = [makeReading(100, null, [1, 2]), makeReading(101, PINK, [2])];

    const assignments = buildTransmitterReadingAssignments(readers, transmitters, readings);

    expect(assignments.get(11)).toEqual({ readingId: 100, color: DEFAULT_READING_COLOR });
    expect(assignments.get(21)).toEqual({ readingId: 101, color: PINK });
  });

  it('returns the default color with no reading id when a transmitter matches nothing', () => {
    const readers = [makeReader(1, 1)];
    const transmitters = [makeTransmitter(11, 1)];
    const readings = [makeReading(100, GREEN, [99])];

    const assignments = buildTransmitterReadingAssignments(readers, transmitters, readings);

    expect(assignments.get(11)).toEqual({ readingId: null, color: DEFAULT_READING_COLOR });
  });

  it('returns default assignments for every transmitter when there are no readings', () => {
    const readers = [makeReader(1, 1)];
    const transmitters = [makeTransmitter(11, 1), makeTransmitter(12, 1)];

    const assignments = buildTransmitterReadingAssignments(readers, transmitters, []);

    expect(assignments.get(11)).toEqual({ readingId: null, color: DEFAULT_READING_COLOR });
    expect(assignments.get(12)).toEqual({ readingId: null, color: DEFAULT_READING_COLOR });
  });
});
