import React from 'react';

import QuranWord from './QuranWord';
import { mockWord } from '../../../../tests/mocks/words';

export default {
  title: 'dls|QuranWord',
};

export const withUthmaniText = () => <QuranWord word={mockWord()} fontStyle="uthmani" />;

export const withIndoParkText = () => <QuranWord word={mockWord()} fontStyle="indopak" />;

export const withMadaniText = () => <QuranWord word={mockWord()} fontStyle="madani" />;
