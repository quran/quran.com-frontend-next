import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';

import QuranWord from './QuranWord';
import { mockWord } from '../../../../tests/mocks/words';

export default {
  title: 'dls|QuranWord',
};

export const withText = () => (
  <QuranWord
    word={mockWord()}
    setCurrentWord={action('setCurrentWord')}
    pause={action('pause')}
    setCurrentVerseKey={action('setCurrentVerseKey')}
    playCurrentWord={action('playCurrentWord')}
    tooltip="transliteration"
    useTextFont
  />
);

export const withGlyph = () => (
  <QuranWord
    word={mockWord()}
    setCurrentWord={action('setCurrentWord')}
    pause={action('pause')}
    setCurrentVerseKey={action('setCurrentVerseKey')}
    playCurrentWord={action('playCurrentWord')}
    tooltip="transliteration"
  />
);
