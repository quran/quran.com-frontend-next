import React, { useState, useEffect } from 'react';

import Combobox from './index';
import SettingIcon from '../../../../../public/icons/settings.svg';
import SearchIcon from '../../../../../public/icons/search.svg';
import ComboboxSize from './ComboboxSize';

export default {
  title: 'dls/Combobox/SingleSelect',
  component: Combobox,
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
        'A function that will be called when an item is selected. The function will pass the name of the item selected along with id of the combobox.',
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
      defaultValue: ComboboxSize.Medium,
      description: `The size of the combobox.`,
      options: Object.values(ComboboxSize).map((size) => size),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    clearable: {
      defaultValue: true,
      options: [true, false],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
      description: 'Whether we should show the clear icon or not when an input value is present.',
    },
    disabled: {
      defaultValue: false,
      options: [true, false],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
      description: 'Whether the combobox is disabled or not.',
    },
    isMultiSelect: {
      defaultValue: false,
      options: [true, false],
      control: { type: 'radio' },
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
      defaultValue: false,
      options: [true, false],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
      description: 'Whether the combobox has an error or not.',
    },
    emptyMessage: {
      defaultValue: 'No results',
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
      defaultValue: 'Search...',
      control: { type: 'text' },
      table: {
        category: 'Optional',
      },
      description: 'The placeholder of the search input.',
    },
  },
};

const ControlledRemoteTemplate = (args) => {
  const [value, setValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // imitate the behavior of fetching from a remote datastore.
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setValue('Item1');
      setIsLoading(false);
    }, 1000);
  }, []);

  const onChange = (newSelectedValue: string) => {
    setValue(newSelectedValue);
  };
  return (
    <Combobox
      {...args}
      value={value}
      initialInputValue={isLoading ? 'Loading...' : value}
      onChange={onChange}
    />
  );
};

// this template will be controlled where the value is a local value and not fetched from a remote datastore.
const ControlledLocalTemplate = (args) => {
  const [value, setValue] = useState('Item1');
  const onChange = (newSelectedValue: string) => {
    setValue(newSelectedValue);
  };
  return <Combobox {...args} value={value} initialInputValue={value} onChange={onChange} />;
};

const Template = (args) => <Combobox {...args} />;

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
  id: 'default',
  items: generateItems(),
};

export const DefaultControlledCombobox = ControlledLocalTemplate.bind({});
DefaultControlledCombobox.args = {
  id: 'controlled-local-single-select',
  items: generateItems(),
};

export const RemoteControlledCombobox = ControlledRemoteTemplate.bind({});
RemoteControlledCombobox.args = {
  id: 'controlled-remote-single-select',
  items: generateItems(),
};

export const ComboboxWithError = Template.bind({});
ComboboxWithError.args = {
  id: 'default',
  items: generateItems(),
  hasError: true,
};

export const DisabledCombobox = Template.bind({});
DisabledCombobox.args = {
  id: 'default',
  items: generateItems(),
  disabled: true,
};

export const ComboboxWithSuffixedItems = Template.bind({});
ComboboxWithSuffixedItems.args = {
  id: 'suffixed',
  items: generateItems(10, true),
};

export const ComboboxWithPrefixedItems = Template.bind({});
ComboboxWithPrefixedItems.args = {
  id: 'prefixed',
  items: generateItems(10, false, true),
};

export const ComboboxWithPrefixedAndSuffixedItems = Template.bind({});
ComboboxWithPrefixedAndSuffixedItems.args = {
  id: 'prefixed_and_suffixed',
  items: generateItems(10, true, true),
};
