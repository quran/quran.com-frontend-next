import React from 'react';
import QuranTranslation from './QuranTranslation';
import mockTranslation from '../../../../tests/mocks/translations';

export default {
  title: 'dls|QuranTranslation',
};

export const normal = () => <QuranTranslation translation={mockTranslation()} />;
