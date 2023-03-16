import { it, expect } from 'vitest';

import { WordByWordType, WordByWordDisplay } from '../../types/QuranReader';

import { consolidateWordByWordState } from './wordByWord';

it('test consolidating when inline translation = false, inline transliteration = false, tooltip = translation', () => {
  const consolidatedState = consolidateWordByWordState(false, false, [WordByWordType.Translation]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP],
    wordByWordContentType: [WordByWordType.Translation],
  });
});

it('test consolidating when inline translation = true, inline transliteration = true, tooltip = translation', () => {
  const consolidatedState = consolidateWordByWordState(true, true, [WordByWordType.Translation]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Translation, WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = false, inline transliteration = true, tooltip = translation', () => {
  const consolidatedState = consolidateWordByWordState(false, true, [WordByWordType.Translation]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Translation, WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = true, inline transliteration = false, tooltip = translation', () => {
  const consolidatedState = consolidateWordByWordState(true, false, [WordByWordType.Translation]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Translation],
  });
});

it('test consolidating when inline translation = false, inline transliteration = false, tooltip = translation,transliteration', () => {
  const consolidatedState = consolidateWordByWordState(false, false, [
    WordByWordType.Translation,
    WordByWordType.Transliteration,
  ]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP],
    wordByWordContentType: [WordByWordType.Translation, WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = true, inline transliteration = true, tooltip = translation,transliteration', () => {
  const consolidatedState = consolidateWordByWordState(true, true, [
    WordByWordType.Translation,
    WordByWordType.Transliteration,
  ]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Translation, WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = true, inline transliteration = false, tooltip = translation,transliteration', () => {
  const consolidatedState = consolidateWordByWordState(true, false, [
    WordByWordType.Translation,
    WordByWordType.Transliteration,
  ]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Transliteration, WordByWordType.Translation],
  });
});

it('test consolidating when inline translation = false, inline transliteration = true, tooltip = translation,transliteration', () => {
  const consolidatedState = consolidateWordByWordState(false, true, [
    WordByWordType.Translation,
    WordByWordType.Transliteration,
  ]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Translation, WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = false, inline transliteration = false, tooltip = transliteration', () => {
  const consolidatedState = consolidateWordByWordState(false, false, [
    WordByWordType.Transliteration,
  ]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP],
    wordByWordContentType: [WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = true, inline transliteration = true, tooltip = transliteration', () => {
  const consolidatedState = consolidateWordByWordState(true, true, [
    WordByWordType.Transliteration,
  ]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Translation, WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = false, inline transliteration = true, tooltip = transliteration', () => {
  const consolidatedState = consolidateWordByWordState(false, true, [
    WordByWordType.Transliteration,
  ]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = true, inline transliteration = false, tooltip = transliteration', () => {
  const consolidatedState = consolidateWordByWordState(true, false, [
    WordByWordType.Transliteration,
  ]);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.TOOLTIP, WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Transliteration, WordByWordType.Translation],
  });
});

it('test consolidating when inline translation = false, inline transliteration = false, tooltip = []', () => {
  const consolidatedState = consolidateWordByWordState(false, false, []);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [],
    wordByWordContentType: [],
  });
});

it('test consolidating when inline translation = true, inline transliteration = true, tooltip = []', () => {
  const consolidatedState = consolidateWordByWordState(true, true, []);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Translation, WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = false, inline transliteration = true, tooltip = []', () => {
  const consolidatedState = consolidateWordByWordState(false, true, []);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Transliteration],
  });
});

it('test consolidating when inline translation = true, inline transliteration = false, tooltip = []', () => {
  const consolidatedState = consolidateWordByWordState(true, false, []);
  expect(consolidatedState).toEqual({
    wordByWordDisplay: [WordByWordDisplay.INLINE],
    wordByWordContentType: [WordByWordType.Translation],
  });
});
