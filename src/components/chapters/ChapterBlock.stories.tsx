import React from 'react';
import ChapterBlock from './ChapterBlock';
import { chapter } from '../../../tests/mocks/chapters';

export default {
  title: 'chapters|ChapterBlock',
};

export const normal = () => <ChapterBlock chapter={chapter} />;
