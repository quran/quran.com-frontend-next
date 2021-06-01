import React from 'react';

import { QuranFont } from 'src/components/QuranReader/types';
import QuranWord from './QuranWord';
import { mockWord } from '../../../../tests/mocks/words';

export default {
  title: 'dls|QuranWord',
};

export const withUthmaniText = () => <QuranWord word={mockWord()} fontStyle={QuranFont.Uthmani} />;

export const withIndoParkText = () => <QuranWord word={mockWord()} fontStyle={QuranFont.IndoPak} />;

export const withMadaniText = () => <QuranWord word={mockWord()} fontStyle={QuranFont.Madani} />;
