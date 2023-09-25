/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { it, expect, describe } from 'vitest';

import { WordByWordType, WordByWordDisplay } from '../../types/QuranReader';

import { areArraysEqual } from './array';
import { consolidateWordByWordState, getDefaultWordByWordDisplay } from './wordByWord';

describe('consolidateWordByWordState', () => {
  it('test consolidating when inline translation = false, inline transliteration = false, tooltip = translation', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(false, false, [
      WordByWordType.Translation,
    ]);

    expect(wordByWordDisplay).toEqual([WordByWordDisplay.TOOLTIP]);
    expect(wordByWordContentType).toEqual([WordByWordType.Translation]);
  });

  it('test consolidating when inline translation = true, inline transliteration = true, tooltip = translation', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(true, true, [
      WordByWordType.Translation,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Translation,
        WordByWordType.Transliteration,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = false, inline transliteration = true, tooltip = translation', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(false, true, [
      WordByWordType.Translation,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Translation,
        WordByWordType.Transliteration,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = true, inline transliteration = false, tooltip = translation', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(true, false, [
      WordByWordType.Translation,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(wordByWordContentType).toEqual([WordByWordType.Translation]);
  });

  it('test consolidating when inline translation = false, inline transliteration = false, tooltip = translation,transliteration', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(false, false, [
      WordByWordType.Translation,
      WordByWordType.Transliteration,
    ]);

    expect(wordByWordDisplay).toEqual([WordByWordDisplay.TOOLTIP]);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Translation,
        WordByWordType.Transliteration,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = true, inline transliteration = true, tooltip = translation,transliteration', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(true, true, [
      WordByWordType.Translation,
      WordByWordType.Transliteration,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Translation,
        WordByWordType.Transliteration,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = true, inline transliteration = false, tooltip = translation,transliteration', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(true, false, [
      WordByWordType.Translation,
      WordByWordType.Transliteration,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Transliteration,
        WordByWordType.Translation,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = false, inline transliteration = true, tooltip = translation,transliteration', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(false, true, [
      WordByWordType.Translation,
      WordByWordType.Transliteration,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Translation,
        WordByWordType.Transliteration,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = false, inline transliteration = false, tooltip = transliteration', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(false, false, [
      WordByWordType.Transliteration,
    ]);

    expect(wordByWordDisplay).toEqual([WordByWordDisplay.TOOLTIP]);
    expect(wordByWordContentType).toEqual([WordByWordType.Transliteration]);
  });

  it('test consolidating when inline translation = true, inline transliteration = true, tooltip = transliteration', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(true, true, [
      WordByWordType.Transliteration,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Translation,
        WordByWordType.Transliteration,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = false, inline transliteration = true, tooltip = transliteration', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(false, true, [
      WordByWordType.Transliteration,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(wordByWordContentType).toEqual([WordByWordType.Transliteration]);
  });

  it('test consolidating when inline translation = true, inline transliteration = false, tooltip = transliteration', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(true, false, [
      WordByWordType.Transliteration,
    ]);

    expect(
      areArraysEqual(wordByWordDisplay, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Transliteration,
        WordByWordType.Translation,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = false, inline transliteration = false, tooltip = []', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(
      false,
      false,
      [],
    );

    expect(wordByWordDisplay).toEqual([]);
    expect(wordByWordContentType).toEqual([]);
  });

  it('test consolidating when inline translation = true, inline transliteration = true, tooltip = []', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(true, true, []);

    expect(wordByWordDisplay).toEqual([WordByWordDisplay.INLINE]);

    expect(
      areArraysEqual(wordByWordContentType, [
        WordByWordType.Translation,
        WordByWordType.Transliteration,
      ]),
    ).toBe(true);
  });

  it('test consolidating when inline translation = false, inline transliteration = true, tooltip = []', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(
      false,
      true,
      [],
    );

    expect(wordByWordDisplay).toEqual([WordByWordDisplay.INLINE]);
    expect(wordByWordContentType).toEqual([WordByWordType.Transliteration]);
  });

  it('test consolidating when inline translation = true, inline transliteration = false, tooltip = []', () => {
    const { wordByWordDisplay, wordByWordContentType } = consolidateWordByWordState(
      true,
      false,
      [],
    );

    expect(wordByWordDisplay).toEqual([WordByWordDisplay.INLINE]);
    expect(wordByWordContentType).toEqual([WordByWordType.Translation]);
  });
});

describe('getDefaultWordByWordDisplay', () => {
  it('when no word by word settings are set', () => {
    const consolidatedState = getDefaultWordByWordDisplay([]);

    expect(consolidatedState).toEqual([WordByWordDisplay.TOOLTIP]);
  });

  it('when tooltip setting is already set', () => {
    const consolidatedState = getDefaultWordByWordDisplay([WordByWordDisplay.TOOLTIP]);

    expect(consolidatedState).toEqual([WordByWordDisplay.TOOLTIP]);
  });

  it('when inline setting is already set', () => {
    const consolidatedState = getDefaultWordByWordDisplay([WordByWordDisplay.INLINE]);

    expect(consolidatedState).toEqual([WordByWordDisplay.INLINE]);
  });

  it('when both tooltip and inline settings are already set', () => {
    const consolidatedState = getDefaultWordByWordDisplay([
      WordByWordDisplay.TOOLTIP,
      WordByWordDisplay.INLINE,
    ]);

    expect(
      areArraysEqual(consolidatedState, [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE]),
    ).toBe(true);
  });

  it('when settings are undefined (have been manually edited)', () => {
    const consolidatedState = getDefaultWordByWordDisplay(undefined);

    expect(consolidatedState).toEqual([WordByWordDisplay.TOOLTIP]);
  });
});
