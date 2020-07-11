import React from 'react';

import { QuranFonts } from 'src/components/QuranReader/types';
import QuranWord from './QuranWord';
import { mockWord } from '../../../../tests/mocks/words';

export default {
  title: 'dls|QuranWord',
};

export const withUthmaniText = () => <QuranWord word={mockWord()} fontStyle={QuranFonts.Uthmani} />;

export const withIndoParkText = () => (
  <QuranWord word={mockWord()} fontStyle={QuranFonts.IndoPak} />
);

export const withMadaniText = () => <QuranWord word={mockWord()} fontStyle={QuranFonts.Madani} />;
