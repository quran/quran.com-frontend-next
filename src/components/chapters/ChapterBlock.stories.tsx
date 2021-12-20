import React from 'react';

import ChapterBlock from './ChapterBlock';

import { chapter, chapters } from 'tests/mocks/chapters';

export default {
  title: 'chapters/ChapterBlock',
  argTypes: {
    chapter: {
      defaultValue: chapter,
      options: {
        [chapters[0].transliteratedName]: chapters[0],
        [chapters[1].transliteratedName]: chapters[1],
        [chapters[2].transliteratedName]: chapters[2],
      },
      control: { type: 'select' },
    },
  },
};

// TODO @Abdellatif: there's a prefetch bug introduced with next 10.0.2 that prevents this component from using next/link. Should be fixed in a subsequent next releases
const Template = (args) => <ChapterBlock chapter={chapter} {...args} />;

export const Normal = Template.bind({});
