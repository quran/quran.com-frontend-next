/* eslint-disable react/no-multi-comp */
import { useState } from 'react';

import Switch, { SwitchSize } from './Switch';

export default {
  title: 'dls/Switch',
  component: Switch,
};

const items = [
  { name: 'Translation', value: 'translation', width: 120 },
  { name: 'Reading', value: 'reading', width: 120 },
];

export const Normal = () => {
  const [selected, setSelected] = useState('translation');
  return <Switch items={items} selected={selected} onSelect={setSelected} />;
};

const threeItems = [
  { name: 'Translation', value: 'translation', width: 120 },
  { name: 'Reading', value: 'reading', width: 120 },
  { name: 'Tafsir', value: 'tafsir', width: 120 },
];

export const WithThreeItems = () => {
  const [selected, setSelected] = useState('reading');
  return <Switch items={threeItems} selected={selected} onSelect={setSelected} />;
};

const disabledItems = [
  { name: 'Translation', value: 'translation', width: 120 },
  { name: 'Reading', value: 'reading', width: 120, disabled: true },
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
