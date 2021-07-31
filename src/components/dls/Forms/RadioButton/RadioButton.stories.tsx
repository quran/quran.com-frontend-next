/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import RadioButton, { RadioButtonSize } from './RadioButton';

export default {
  title: 'dls|RadioButton',
  component: RadioButton,
  argTypes: {
    id: {
      table: {
        category: 'Required',
      },
      description: 'The ID of the radio input.',
    },
    onChange: {
      table: {
        category: 'Required',
      },
      description:
        'A function that will be called when the radio button changes either from checked=>un-checked or the other way around.',
    },
    size: {
      defaultValue: RadioButtonSize.Medium,
      description: `The size of the RadioButton.`,
      options: [RadioButtonSize.Large, RadioButtonSize.Medium, RadioButtonSize.Small],
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
      description: 'Toggle checked value for the radio input.',
    },
    disabled: {
      defaultValue: false,
      options: [true, false],
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Control whether the radio input should be disabled or not.',
    },
    label: {
      table: {
        category: 'Optional',
      },
      description: 'The label of the radio button.',
    },
    name: {
      table: {
        category: 'Optional',
      },
      description: 'The name of the radio input.',
    },
    value: {
      table: {
        category: 'Optional',
      },
      description: 'The value of the radio input.',
    },
  },
};

const Template = (args) => <RadioButton {...args} />;

export const DefaultRadioButton = Template.bind({});
DefaultRadioButton.args = {
  id: 'option1',
  name: 'option1',
  value: 'option1',
  label: 'option 1',
  checked: false,
  onChange: () => {},
};
