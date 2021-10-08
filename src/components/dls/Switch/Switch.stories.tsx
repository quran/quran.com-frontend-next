import { useState } from 'react';

import Switch from './Switch';

export default {
  title: 'dls/Switch',
  component: Switch,
};

const items = [
  { name: 'Translation', value: 'translation' },
  { name: 'Reading', value: 'reading' },
];

export const Normal = () => {
  const [selected, setSelected] = useState('reading');
  return <Switch items={items} selected={selected} onChange={setSelected} />;
};
