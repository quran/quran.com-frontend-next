import React from 'react';
import Checkbox, { CheckboxSize } from './Checkbox';

export default {
  title: 'dls|Checkbox',
  component: Checkbox,
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
    size: {
      defaultValue: CheckboxSize.Medium,
      description: `The size of the RadioButton.`,
      options: [CheckboxSize.Large, CheckboxSize.Medium, CheckboxSize.Small],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    checked: {
      defaultValue: false,
      options: [true, false],
      control: { type: 'boolean' },
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
    disabled: {
      defaultValue: false,
      options: [true, false],
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Control whether the checkbox input should be disabled or not.',
    },
    label: {
      table: {
        category: 'Optional',
      },
      description: 'The label of the checkbox.',
    },
  },
};

const Template = (args) => <Checkbox {...args} />;

export const DefaultCheckbox = Template.bind({});
DefaultCheckbox.args = {
  id: 'option1',
  name: 'option1',
  label: 'Checkbox Value',
  checked: false,
  disabled: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: () => {},
};
