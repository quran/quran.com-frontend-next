/* eslint-disable react/no-multi-comp */
import { useState } from 'react';

import Switch, { SwitchSize } from './Switch';

export default {
  title: 'dls/Switch',
  component: Switch,
};

const items = [
  { name: 'Translation', value: 'translation' },
  { name: 'Reading', value: 'reading' },
];

export const Normal = () => {
  const [selected, setSelected] = useState('translation');
  return <Switch items={items} selected={selected} onSelect={setSelected} />;
};

const threeItems = [
  { name: 'Translation', value: 'translation' },
  { name: 'Reading', value: 'reading' },
  { name: 'Tafsir', value: 'tafsir' },
];

export const WithThreeItems = () => {
  const [selected, setSelected] = useState('reading');
  return <Switch items={threeItems} selected={selected} onSelect={setSelected} />;
};

const disabledItems = [
  { name: 'Translation', value: 'translation' },
  { name: 'Reading', value: 'reading', disabled: true },
];

export const WithDisabled = () => {
  const [selected, setSelected] = useState('translation');
  return <Switch items={disabledItems} selected={selected} onSelect={setSelected} />;
};

export const Small = () => {
  const [selected, setSelected] = useState('translation');
  return (
    <Switch items={items} selected={selected} onSelect={setSelected} size={SwitchSize.Small} />
  );
};

export const Large = () => {
  const [selected, setSelected] = useState('translation');
  return (
    <Switch items={items} selected={selected} onSelect={setSelected} size={SwitchSize.Large} />
  );
};
