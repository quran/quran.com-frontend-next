import React, { useState } from 'react';

import Tabs from './Tabs';

export default {
  title: 'dls/Tabs',
  component: Tabs,
};

const tabs = [
  { title: 'Translation', value: 'translation' },
  { title: 'Reading', value: 'reading' },
];

const Template = (args) => {
  const [selected, setSelected] = useState('translation');

  return (
    <span className="previewWrapper">
      <Tabs tabs={tabs} selected={selected} onSelect={setSelected} {...args} />
    </span>
  );
};

export const Default = Template.bind({});
Default.args = {};
