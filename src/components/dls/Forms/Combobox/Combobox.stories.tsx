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

const ITEMS = [
  {
    id: 'Item1',
    name: 'Item1',
    value: 'Item1',
    label: 'Item 1',
  },
  {
    id: 'Item2',
    name: 'Item2',
    value: 'Item2',
    label: 'Item 2',
  },
];
const SUFFIXED_ITEMS = [
  {
    id: 'Item1',
    name: 'Item1',
    value: 'Item1',
    label: 'Item 1',
    suffix: 'Quran',
  },
  {
    id: 'Item2',
    name: 'Item2',
    value: 'Item2',
    label: 'Item 2',
    suffix: 'Sunnah',
  },
];
const PREFIXED_ITEMS = [
  {
    id: 'Item1',
    name: 'Item1',
    value: 'Item1',
    label: 'Item 1',
    prefix: <SettingIcon />,
  },
  {
    id: 'Item2',
    name: 'Item2',
    value: 'Item2',
    label: 'Item 2',
    prefix: <SearchIcon />,
  },
];
const PREFIXED_AND_SUFFIXED_ITEMS = [
  {
    id: 'Item1',
    name: 'Item1',
    value: 'Item1',
    label: 'Item 1',
    suffix: 'Quran',
    prefix: <SettingIcon />,
  },
  {
    id: 'Item2',
    name: 'Item2',
    value: 'Item2',
    label: 'Item 2',
    suffix: 'Sunnah',
    prefix: <SearchIcon />,
  },
];

export const DefaultCombobox = Template.bind({});
DefaultCombobox.args = {
  id: 'default',
  items: ITEMS,
};

export const ComboboxWithError = Template.bind({});
ComboboxWithError.args = {
  id: 'default',
  items: ITEMS,
  hasError: true,
};

export const DisabledCombobox = Template.bind({});
DisabledCombobox.args = {
  id: 'default',
  items: ITEMS,
  disabled: true,
};

export const ComboboxWithSuffixedItems = Template.bind({});
ComboboxWithSuffixedItems.args = {
  id: 'suffixed',
  items: SUFFIXED_ITEMS,
};

export const ComboboxWithPrefixedItems = Template.bind({});
ComboboxWithPrefixedItems.args = {
  id: 'prefixed',
  items: PREFIXED_ITEMS,
};

export const ComboboxWithPrefixedAndSuffixedItems = Template.bind({});
ComboboxWithPrefixedAndSuffixedItems.args = {
  id: 'prefixed_and_suffixed',
  items: PREFIXED_AND_SUFFIXED_ITEMS,
};
