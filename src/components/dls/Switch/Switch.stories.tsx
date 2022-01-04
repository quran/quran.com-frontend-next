import { useState } from 'react';

import Switch, { SwitchSize } from './Switch';
import styles from './Switch.stories.module.scss';

export default {
  title: 'dls/Switch',
  component: Switch,
  argTypes: {
    size: {
      description: `[OPTIONAL] The size of the Switch`,
      options: Object.values(SwitchSize),
      control: { type: 'radio' },
      defaultValue: SwitchSize.Normal,
      table: {
        category: 'Optional',
      },
    },
    items: {
      table: {
        category: 'Required',
      },
    },
    selected: {
      table: {
        category: 'Required',
      },
    },
    onSelect: {
      table: {
        category: 'Required',
      },
    },
  },
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

export const Default = Template.bind({});
Default.args = {};

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
