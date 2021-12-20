/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';

import RadioGroup, { RadioGroupOrientation } from './RadioGroup';

export default {
  title: 'dls/RadioGroup',
  component: RadioGroup,
  args: {
    disabled: false,
    orientation: RadioGroupOrientation.Vertical,
  },
  argTypes: {
    items: {
      table: {
        category: 'Required',
      },
      description: 'The Radio items',
    },
    label: {
      table: {
        category: 'Required',
      },
      description: 'The label that will be used inside aria-label',
    },
    disabled: {
      options: [true, false],
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description:
        'Control whether the radio group should be disabled or not. if it is disabled, every radio item will be disabled.',
    },
    defaultValue: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description:
        'The value of the radio item that should be checked when initially rendered. Use when the radio group is not controlled.',
    },
    value: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The controlled value of the radio item to check.',
    },
    name: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The name of the group when submitted within a form.',
    },
    required: {
      table: {
        category: 'Optional',
      },
      options: [true, false],
      control: { type: 'boolean' },
      description:
        'When true, indicates that the user must check a radio item before the owning form can be submitted.',
    },
    orientation: {
      table: {
        category: 'Optional',
      },
      options: [RadioGroupOrientation.Horizontal, RadioGroupOrientation.Vertical],
      control: { type: 'radio' },
      description: 'The orientation of the component.',
    },
    onChange: {
      table: {
        category: 'Optional',
      },
      description: 'An event handler that will be called when the value changes.',
    },
  },
};

const Template = (args) => (
  <span className="previewWrapper">
    <RadioGroup {...args} />
  </span>
);

export const DefaultRadioGroup = Template.bind({});
DefaultRadioGroup.args = {
  items: [
    {
      value: 'option1',
      id: 'option1',
      label: 'Option 1',
      disabled: false,
      required: false,
    },
    {
      value: 'option2',
      id: 'option2',
      label: 'Option 2',
      disabled: false,
      required: false,
    },
    {
      value: 'option3',
      id: 'option3',
      label: 'Option 3',
      disabled: true,
      required: false,
    },
  ],
};
