/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useState, useCallback } from 'react';

import TextArea, { TextAreaSize, TextAreaType } from '.';

export default {
  title: 'dls/TextArea',
  component: TextArea,
  args: {
    disabled: false,
    value: '',
  },
  argTypes: {
    size: {
      description: `The size of the text area.`,
      options: Object.values(TextAreaSize).map((size) => size),
      control: { type: 'radio' },
      table: { category: 'Optional' },
    },
    placeholder: {
      control: { type: 'text' },
      table: { category: 'Optional' },
      defaultValue: 'Start Typing...',
      description: 'The placeholder of the input.',
    },
    disabled: {
      options: [true, false],
      defaultValue: false,
      control: { type: 'boolean' },
      table: { category: 'Optional' },
      description: 'Whether the input is disabled or not.',
    },
    value: {
      table: { category: 'Optional' },
      control: { type: 'text' },
      description: 'The value of the input.',
    },
    onChange: {
      table: { category: 'Optional' },
      description: 'A function that will be called when the value of the input changes.',
    },
    type: {
      description: `The type of the input.`,
      options: Object.values(TextAreaType).map((type) => type),
      control: { type: 'radio' },
      table: { category: 'Optional' },
    },
    id: {
      control: { type: 'text' },
      table: { category: 'Required' },
      description:
        'A unique identifier for the input. This is added to avoid collision when 2 inputs are existent in the DOM.',
    },
    name: {
      control: { type: 'text' },
      table: { category: 'Optional' },
      description: 'The name of the input. This will be used when Input is used inside a form.',
    },
    label: {
      control: { type: 'text' },
      table: { category: 'Optional' },
      description: 'The label of the input.',
      defaultValue: 'Some Label',
    },
  },
};

// this template will be controlled where the value is a local value and not fetched from a remote datastore.
const ControlledLocalTemplate = (args) => {
  const [value, setValue] = useState('input value');
  const onChange = useCallback((newSelectedValue: string) => {
    setValue(newSelectedValue);
  }, []);
  const onClearClicked = useCallback(() => {
    setValue('');
  }, []);

  return (
    <span className="previewWrapper">
      <TextArea value={value} onChange={onChange} onClearClicked={onClearClicked} {...args} />
    </span>
  );
};

const Template = (args) => (
  <span className="previewWrapper">
    <TextArea {...args} />
  </span>
);
export const DefaultInput = Template.bind({});
DefaultInput.args = {
  id: 'default-input',
};
export const DisabledInput = Template.bind({});
DisabledInput.args = {
  id: 'disabled-input',
  disabled: true,
};
export const DefaultControlledInput = ControlledLocalTemplate.bind({});
DefaultControlledInput.args = {
  id: 'locally-controlled-input',
  value: 'input value',
};
export const ErrorInput = Template.bind({});
ErrorInput.args = {
  id: 'error-input',
  type: TextAreaType.Error,
};
export const SuccessInput = Template.bind({});
SuccessInput.args = {
  id: 'success-input',
  type: TextAreaType.Success,
};
export const WarningInput = Template.bind({});
WarningInput.args = {
  id: 'warning-input',
  type: TextAreaType.Warning,
};
export const LabeledInput = Template.bind({});
LabeledInput.args = {
  id: 'labelled-input',
  label: 'Full Name',
};
