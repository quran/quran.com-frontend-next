import React from 'react';

import QuranWord from './QuranWord';

import { mockWord } from 'tests/mocks/words';
import { QuranFont } from 'types/QuranReader';

export default {
  title: 'dls/QuranWord',
};

export const withUthmaniText = () => (
  <QuranWord word={mockWord()} font={QuranFont.Uthmani} isFontLoaded />
);
export const withIndoPakText = () => (
  <QuranWord word={mockWord()} font={QuranFont.IndoPak} isFontLoaded />
);

export const withQCFV1Text = () => (
  <QuranWord word={mockWord()} font={QuranFont.MadaniV1} isFontLoaded />
);
export const withQCFV2Text = () => (
  <QuranWord word={mockWord()} font={QuranFont.MadaniV2} isFontLoaded />
);
