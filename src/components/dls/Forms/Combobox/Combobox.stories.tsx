import React from 'react';

import Combobox, { ComboboxSize } from './index';
import SettingIcon from '../../../../../public/icons/settings.svg';
import SearchIcon from '../../../../../public/icons/search.svg';

export default {
  title: 'dls/Combobox',
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

export const ComboboxWithMultiSelect = Template.bind({});
ComboboxWithMultiSelect.args = {
  id: 'multi-select',
  items: generateItems(),
  isMultiSelect: true,
};

export const ComboboxWithPreSelectedItems = Template.bind({});
ComboboxWithPreSelectedItems.args = {
  id: 'multi-select-with-preselected-items',
  items: generateItems(),
  isMultiSelect: true,
  value: ['Item1', 'Item2', 'Item3', 'Item4'],
};
