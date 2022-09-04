/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useState, useEffect, useCallback } from 'react';

import ComboboxSize from './types/ComboboxSize';

import Combobox from './index';

import SearchIcon from '@/icons/search.svg';
import SettingIcon from '@/icons/settings.svg';

export default {
  title: 'dls/Combobox/MultiSelect',
  component: Combobox,
  args: {
    size: ComboboxSize.Medium,
    clearable: true,
    disabled: false,
    isMultiSelect: true,
    hasError: false,
    minimumRequiredItems: 0,
    emptyMessage: 'No results',
    placeholder: 'Search...',
  },
  argTypes: {
    id: {
      table: {
        category: 'Required',
      },
      description:
        'A unique identifier for the combobox. This is added to avoid collision when 2 comboboxs are existent in the DOM.',
    },
    items: {
      table: {
        category: 'Required',
      },
      description:
        'The items of the combobox. Each item is required to have id, value, name, label. checked, disabled, prefix and suffix are optional.',
    },
    onChange: {
      table: {
        category: 'Optional',
      },
      description:
        'A function that will be called when an item is selected. The function will pass the name of the item selected along with id of the combobox. This should be used with useCallback.',
    },
    initialInputValue: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The initial input value.',
    },
    value: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The value of "name" attribute of the selected item.',
    },
    size: {
      description: `The size of the combobox.`,
      options: Object.values(ComboboxSize).map((size) => size),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    clearable: {
      options: [true, false],
      defaultValue: true,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Whether we should show the clear icon or not when an input value is present.',
    },
    disabled: {
      options: [true, false],
      defaultValue: false,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Whether the combobox is disabled or not.',
    },
    isMultiSelect: {
      options: [true, false],
      defaultValue: true,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Whether the combobox should support multi-select.',
    },
    tagsLimit: {
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
      description: 'The maximum number of items allowed to be selected.',
    },
    hasError: {
      options: [true, false],
      defaultValue: false,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Whether the combobox has an error or not.',
    },
    minimumRequiredItems: {
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
      description:
        'If above 0 will indicate the minimum number of items that should be present at any give time. This will be useful when controlling the component.',
    },
    emptyMessage: {
      control: { type: 'text' },
      table: {
        category: 'Optional',
      },
      description: 'The text that shows when no items match the search query.',
    },
    label: {
      control: { type: 'text' },
      table: {
        category: 'Optional',
      },
      description: 'The label of the combobox.',
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

const ControlledRemoteTemplate = (args) => {
  const [value, setValue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // imitate the behavior of fetching from a remote datastore.
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setValue(['Item1', 'Item2', 'Item3', 'Item4']);
      setIsLoading(false);
    }, 1000);
  }, []);
  const onChange = useCallback((newSelectedValues: string[]) => {
    setValue(newSelectedValues);
  }, []);
  return (
    <span className="previewWrapper">
      <Combobox
        {...args}
        value={value}
        initialInputValue={isLoading ? 'Loading...' : ''}
        isMultiSelect
        onChange={onChange}
      />
    </span>
  );
};

// this template will be controlled where the value is a local value and not fetched from a remote datastore.
const ControlledLocalTemplate = (args) => {
  const [value, setValue] = useState(['Item1', 'Item2', 'Item3', 'Item4']);

  const onChange = useCallback((newSelectedValues: string[]) => {
    setValue(newSelectedValues);
  }, []);
  return (
    <span className="previewWrapper">
      <Combobox {...args} value={value} isMultiSelect onChange={onChange} />
    </span>
  );
};

const Template = (args) => (
  <span className="previewWrapper">
    <Combobox isMultiSelect {...args} />
  </span>
);

const generateItems = (numberOfItems = 10, hasSuffix = false, hasPrefix = false) => {
  const items = [];
  for (let index = 1; index <= numberOfItems; index += 1) {
    items.push({
      id: `Item${index}`,
      name: `Item${index}`,
      value: `Item${index}`,
      label: `Item ${index}`,
      ...(hasSuffix && { suffix: index % 2 ? `Item` : 'Another-Item' }),
      ...(hasPrefix && { prefix: index % 2 ? <SettingIcon /> : <SearchIcon /> }),
    });
  }
  return items;
};

export const DefaultCombobox = Template.bind({});
DefaultCombobox.args = {
  id: 'multi-select',
  items: generateItems(),
};

export const ControlledCombobox = ControlledLocalTemplate.bind({});
ControlledCombobox.args = {
  id: 'controlled-local-multi-select',
  items: generateItems(),
};

export const ControlledComboboxWithARequiredValue = ControlledLocalTemplate.bind({});
ControlledComboboxWithARequiredValue.args = {
  id: 'controlled-local-multi-select-with-required-value',
  items: generateItems(),
  minimumRequiredItems: 4,
};

export const RemoteControlledCombobox = ControlledRemoteTemplate.bind({});
RemoteControlledCombobox.args = {
  id: 'controlled-remote-multi-select',
  items: generateItems(),
};
