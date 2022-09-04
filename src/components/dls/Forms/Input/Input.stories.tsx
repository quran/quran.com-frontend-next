/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useState, useEffect, useCallback } from 'react';

import Input, { InputSize, InputType } from '.';

import SearchIcon from '@/icons/search.svg';
import SettingIcon from '@/icons/settings.svg';

export default {
  title: 'dls/Input',
  component: Input,
  args: {
    size: InputSize.Medium,
    fixedWidth: true,
    disabled: false,
    clearable: false,
    value: '',
  },
  argTypes: {
    size: {
      description: `The size of the input.`,
      options: Object.values(InputSize).map((size) => size),
      control: { type: 'radio' },
      table: { category: 'Optional' },
    },
    placeholder: {
      control: { type: 'text' },
      table: { category: 'Optional' },
      defaultValue: 'Start Typing...',
      description: 'The placeholder of the input.',
    },
    fixedWidth: {
      options: [true, false],
      defaultValue: true,
      control: { type: 'boolean' },
      table: { category: 'Optional' },
      description: 'Whether the input should have a fixed width or take the width of its parent.',
    },
    disabled: {
      options: [true, false],
      defaultValue: false,
      control: { type: 'boolean' },
      table: { category: 'Optional' },
      description: 'Whether the input is disabled or not.',
    },
    prefix: {
      table: { category: 'Optional' },
      description: 'The prefix of the input.',
    },
    suffix: {
      table: { category: 'Optional' },
      description: 'The suffix of the input.',
    },
    clearable: {
      options: [true, false],
      defaultValue: false,
      control: { type: 'boolean' },
      table: { category: 'Optional' },
      description: 'Whether we should show the clear icon or not when an input value is present.',
    },
    onClearClicked: {
      table: { category: 'Optional' },
      description: 'on clear button clicked. This will only be used when clearable is set to true.',
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
      options: Object.values(InputType).map((type) => type),
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

const ControlledRemoteTemplate = (args) => {
  const [value, setValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { disabled } = args;

  // imitate the behavior of fetching from a remote datastore.
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setValue('Item1');
      setIsLoading(false);
    }, 1000);
  }, []);

  const onChange = useCallback((newSelectedValue: string) => {
    setValue(newSelectedValue);
  }, []);

  const onClearClicked = useCallback(() => {
    setValue('');
  }, []);

  return (
    <span className="previewWrapper">
      <Input
        value={value}
        placeholder={isLoading ? 'Loading...' : ''}
        disabled={isLoading || disabled}
        onChange={onChange}
        onClearClicked={onClearClicked}
        {...args}
      />
    </span>
  );
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
      <Input value={value} onChange={onChange} onClearClicked={onClearClicked} {...args} />
    </span>
  );
};

const Template = (args) => (
  <span className="previewWrapper">
    <Input {...args} />
  </span>
);
const PrefixIcon = <SettingIcon />;
const SuffixIcon = <SearchIcon />;
const Prefix = <p>https://</p>;
const Suffix = <p>.com</p>;
export const DefaultInput = Template.bind({});
DefaultInput.args = {
  id: 'default-input',
};
export const InputWithAutoWidth = Template.bind({});
InputWithAutoWidth.args = {
  id: 'auto-width-input',
  fixedWidth: false,
};
export const WithPrefix = Template.bind({});
WithPrefix.args = {
  id: 'default-input-with-prefix',
  prefix: Prefix,
};
export const WithSuffix = Template.bind({});
WithSuffix.args = {
  id: 'default-input-with-suffix',
  suffix: Suffix,
};
export const WithPrefixAndSuffix = Template.bind({});
WithPrefixAndSuffix.args = {
  id: 'default-input-with-prefix-and-suffix',
  prefix: Prefix,
  suffix: Suffix,
};
export const WithIconPrefix = Template.bind({});
WithIconPrefix.args = {
  id: 'default-input-with-icon-prefix',
  prefix: PrefixIcon,
};
export const WithIconSuffix = Template.bind({});
WithIconSuffix.args = {
  id: 'default-input-with-icon-suffix',
  suffix: SuffixIcon,
};
export const WithIconPrefixAndSuffix = Template.bind({});
WithIconPrefixAndSuffix.args = {
  id: 'default-input-with-icon-prefix-and-suffix',
  prefix: PrefixIcon,
  suffix: SuffixIcon,
};
export const DisabledInput = Template.bind({});
DisabledInput.args = {
  id: 'disabled-input',
  disabled: true,
};
export const DefaultControlledInput = ControlledLocalTemplate.bind({});
DefaultControlledInput.args = {
  id: 'locally-controlled-input',
  clearable: true,
};
export const RemoteControlledInput = ControlledRemoteTemplate.bind({});
RemoteControlledInput.args = {
  id: 'remotely-controlled-input',
  clearable: true,
};
export const ErrorInput = Template.bind({});
ErrorInput.args = {
  id: 'error-input',
  type: InputType.Error,
};
export const SuccessInput = Template.bind({});
SuccessInput.args = {
  id: 'success-input',
  type: InputType.Success,
};
export const WarningInput = Template.bind({});
WarningInput.args = {
  id: 'warning-input',
  type: InputType.Warning,
};
export const LabeledInput = Template.bind({});
LabeledInput.args = {
  id: 'labelled-input',
  label: 'Full Name',
};
