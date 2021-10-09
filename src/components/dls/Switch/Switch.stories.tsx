import { useState } from 'react';

import Switch from './Switch';

export default {
  title: 'dls/Switch',
  component: Switch,
};

const items = [
  { name: 'Translation', value: 'translation', width: 120 },
  { name: 'Reading', value: 'reading', width: 120 },
];

export const Normal = () => {
  const [selected, setSelected] = useState('reading');
  return <Switch items={items} selected={selected} onSelect={setSelected} />;
};
