import { useState } from 'react';

import Switch, { SwitchSize } from './Switch';
import styles from './Switch.stories.module.scss';

export default {
  title: 'dls/Switch',
  component: Switch,
};

const items = [
  { name: 'Translation', value: 'translation' },
  { name: 'Reading', value: 'reading' },
];
const Template = (args) => {
  const [selected, setSelected] = useState('translation');
  return (
    <div className={styles.switchContainer}>
      <Switch selected={selected} onSelect={setSelected} items={items} {...args} />
    </div>
  );
};

export const Medium = Template.bind({});
Medium.args = {};

export const Small = Template.bind({});
Small.args = {
  size: SwitchSize.Small,
};

export const Large = Template.bind({});
Large.args = {
  size: SwitchSize.Large,
};

export const WithThreeItems = Template.bind({});
WithThreeItems.args = {
  items: [
    { name: 'Translation', value: 'translation' },
    { name: 'Reading', value: 'reading' },
    { name: 'Tafsir', value: 'tafsir' },
  ],
};

export const WithDisabledItem = Template.bind({});
WithDisabledItem.args = {
  items: [
    { name: 'Translation', value: 'translation' },
    { name: 'Reading', value: 'reading', disabled: true },
  ],
};
