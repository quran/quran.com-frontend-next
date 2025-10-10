import React from 'react';

import Checkbox from './Checkbox';

export default {
  title: 'dls/Checkbox',
  component: Checkbox,
  args: {
    isDisabled: false,
  },
  argTypes: {
    id: {
      table: {
        category: 'Required',
      },
      description: 'The ID of the checkbox input.',
    },
    onChange: {
      table: {
        category: 'Required',
      },
      description:
        'A function that will be called when the checkbox button changes either from checked=>un-checked or the other way around.',
    },
    isChecked: {
      options: [true, false, 'indeterminate'],
      control: { type: 'select' },
      table: {
        category: 'Optional',
      },
      description: 'Toggle checked value for the checkbox input.',
    },
    name: {
      table: {
        category: 'Optional',
      },
      description: 'The name of the radio input.',
    },
    isDisabled: {
      options: [true, false],
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Control whether the checkbox input should be disabled or not.',
    },
    isRequired: {
      options: [true, false],
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Control whether the checkbox input should be required or not.',
    },
    label: {
      table: {
        category: 'Optional',
      },
      description: 'The label of the checkbox.',
      control: { type: 'text' },
    },
  },
};

const Template = (args) => (
  <span className="previewWrapper">
    <Checkbox {...args} />
  </span>
);

export const DefaultCheckbox = Template.bind({});
DefaultCheckbox.args = {
  id: 'option1',
  name: 'option1',
  label: 'Checkbox Value',
  isDisabled: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: () => {},
};
