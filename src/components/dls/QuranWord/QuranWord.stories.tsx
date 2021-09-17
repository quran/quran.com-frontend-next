import React from 'react';

import QuranWord from './QuranWord';

import { QuranFont } from 'src/components/QuranReader/types';
import { mockWord } from 'tests/mocks/words';

export default {
  title: 'dls/QuranWord',
};

export const withUthmaniText = () => <QuranWord word={mockWord()} font={QuranFont.Uthmani} />;
export const withIndoPakText = () => <QuranWord word={mockWord()} font={QuranFont.IndoPak} />;

export const withQCFV1Text = () => <QuranWord word={mockWord()} font={QuranFont.MadaniV1} />;
export const withQCFV2Text = () => <QuranWord word={mockWord()} font={QuranFont.MadaniV2} />;
