/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useEffect, useState } from 'react';

import Select, { SelectSize } from '.';

export default {
  title: 'dls/Select',
  component: Select,
  args: {
    disabled: false,
    required: false,
    size: SelectSize.Medium,
    placeholder: 'Select an option',
  },
  argTypes: {
    id: {
      table: {
        category: 'Required',
      },
      description:
        'A unique identifier for the select. This is added to avoid collision when 2 selects are existent in the DOM.',
    },
    name: {
      table: {
        category: 'Required',
      },
      description: 'The name of the select for when submitting a form that has it.',
    },
    options: {
      table: {
        category: 'Required',
      },
      description: 'The options of the select. Each option is required to have label and value.',
    },
    onChange: {
      table: {
        category: 'Optional',
      },
      description:
        'A function that will be called when an option is selected. The function will pass value of the option selected.',
    },
    disabled: {
      control: { type: 'boolean' },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
      description: 'Whether the select is disabled or not.',
    },
    required: {
      control: { type: 'boolean' },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
      description: 'Whether the select is required or not for when submitting a form that has it.',
    },
    defaultStyle: {
      control: { type: 'boolean' },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
      description: 'Whether the select is default styled or not.',
    },
    withBackground: {
      control: { type: 'boolean' },
      defaultValue: true,
      table: {
        category: 'Optional',
      },
      description: 'Whether the select is with a background or not.',
    },
    size: {
      description: `The size of the select.`,
      options: Object.values(SelectSize).map((size) => size),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    value: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'the value of the selected item.',
    },
    placeholder: {
      control: { type: 'text' },
      table: {
        category: 'Optional',
      },
      description: 'The placeholder of the search input.',
    },
  },
};

const generateOptions = (numberOfOptions = 10, generateDisabled = false) => {
  const options = [];
  for (let index = 1; index <= numberOfOptions; index += 1) {
    options.push({
      label: `Option ${index}`,
      value: `option${index}`,
      ...(generateDisabled && { disabled: !(index % 2) }),
    });
  }
  return options;
};

const Template = (args) => (
  <span className="previewWrapper">
    <Select {...args} />
  </span>
);

const ControlledRemoteValueTemplate = (args) => {
  const [value, setValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { disabled } = args;

  // imitate the behavior of fetching from a remote datastore.
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setValue('option5');
      setIsLoading(false);
    }, 1000);
  }, []);

  const onChange = (newSelectedValue: string | number) => {
    setValue(newSelectedValue);
  };
  return (
    <span className="previewWrapper">
      <Select
        {...args}
        value={value}
        onChange={onChange}
        placeholder={isLoading ? 'Loading...' : null}
        disabled={disabled || isLoading}
      />
    </span>
  );
};

const ControlledRemoteOptionsAndValueTemplate = (args) => {
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { disabled } = args;

  // imitate the behavior of fetching from a remote datastore.
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setOptions(generateOptions());
      setValue('option5');
      setIsLoading(false);
    }, 1000);
  }, []);

  const onChange = (newSelectedValue: string | number) => {
    setValue(newSelectedValue);
  };

  return (
    <span className="previewWrapper">
      <Select
        {...args}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={isLoading ? 'Loading...' : null}
        disabled={disabled || isLoading}
      />
    </span>
  );
};

export const DefaultSelect = Template.bind({});
DefaultSelect.args = {
  options: generateOptions(),
  id: 'defaultSelect',
  name: 'defaultSelect',
};

export const WithSomeDisabledOptions = Template.bind({});
WithSomeDisabledOptions.args = {
  options: generateOptions(10, true),
  id: 'withSomeDisabledOptions',
  name: 'withSomeDisabledOptions',
};

export const RemoteValue = ControlledRemoteValueTemplate.bind({});
RemoteValue.args = {
  options: generateOptions(),
  id: 'remoteValue',
  name: 'remoteValue',
};

export const RemoteOptionsAndValue = ControlledRemoteOptionsAndValueTemplate.bind({});
RemoteOptionsAndValue.args = {
  id: 'remoteOptionsAndValue',
  name: 'remoteOptionsAndValue',
};
