import merge from 'lodash/merge';

const mockFootnoteKhattabSurah1Verse2 = (overrides = {}) =>
  merge(
    {
      text: 'i.e., Lord of everything in existence including angels, humans, and animals.',
    },
    overrides,
  );

export default mockFootnoteKhattabSurah1Verse2;
