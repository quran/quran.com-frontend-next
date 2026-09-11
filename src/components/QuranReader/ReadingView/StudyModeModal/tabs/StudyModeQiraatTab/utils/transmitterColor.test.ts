import { describe, expect, it } from 'vitest';

import { QiraatReading } from '@/types/Qiraat';

import { DEFAULT_READER_COLOR, getTransmitterColor } from './transmitterColor';

const reading = (overrides: Partial<QiraatReading>): QiraatReading => ({
  id: 1,
  position: 1,
  text: '',
  textUthmani: '',
  textImlaei: null,
  grammaticalForm: null,
  rootLetters: null,
  color: '#EA9999',
  translation: null,
  translations: null,
  transliteration: null,
  explanation: null,
  explanations: null,
  matrix: { readers: [], transmitters: [], cells: [] },
  ...overrides,
});

describe('getTransmitterColor', () => {
  it('uses the direct matrix membership first', () => {
    const readings = [
      reading({
        color: '#B7D7A8',
        matrix: { readers: [], transmitters: [7], cells: [] },
      }),
    ];

    expect(getTransmitterColor(7, 3, readings)).toBe('#B7D7A8');
  });

  it('inherits the color from the parent reader', () => {
    const readings = [
      reading({
        color: '#A4C2F4',
        matrix: { readers: [3], transmitters: [], cells: [] },
      }),
    ];

    expect(getTransmitterColor(7, 3, readings)).toBe('#A4C2F4');
  });

  it('falls back to matrix cells when top-level lists miss (refs #3286)', () => {
    // Models 2:245: the pink reading does not list the transmitter (or its
    // reader) in the top-level matrix arrays — only the cells do.
    const readings = [
      reading({
        color: '#EA9999',
        matrix: {
          readers: [],
          transmitters: [],
          cells: [
            { readerId: 9, transmitterId: 21, type: 'transmitter' },
            { readerId: 9, transmitterId: null, type: 'reader' },
          ],
        },
      }),
    ];

    expect(getTransmitterColor(21, 9, readings)).toBe('#EA9999');
    expect(getTransmitterColor(99, 9, readings)).toBe('#EA9999');
  });

  it('prefers direct and inherited matches over cells', () => {
    const readings = [
      reading({
        color: '#B7D7A8',
        matrix: {
          readers: [],
          transmitters: [7],
          cells: [{ readerId: 9, transmitterId: 7, type: 'transmitter' }],
        },
      }),
      reading({
        color: '#EA9999',
        matrix: { readers: [], transmitters: [], cells: [] },
      }),
    ];

    expect(getTransmitterColor(7, 3, readings)).toBe('#B7D7A8');
  });

  it('falls back to white when nothing associates the transmitter', () => {
    const readings = [
      reading({
        color: '#B7D7A8',
        matrix: { readers: [1], transmitters: [2], cells: [] },
      }),
    ];

    expect(getTransmitterColor(7, 3, readings)).toBe(DEFAULT_READER_COLOR);
    expect(getTransmitterColor(7, 3, [])).toBe(DEFAULT_READER_COLOR);
  });
});
