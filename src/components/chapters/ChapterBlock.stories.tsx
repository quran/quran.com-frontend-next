import React from 'react';

import { chapter } from '../../../tests/mocks/chapters';

import ChapterBlock from './ChapterBlock';

export default {
  title: 'chapters/ChapterBlock',
};

// TODO @Abdellatif: there's a prefetch bug introduced with next 10.0.2 that prevents this component from using next/link. Should be fixed in a subsequent next releases
export const normal = () => <ChapterBlock chapter={chapter} />;
