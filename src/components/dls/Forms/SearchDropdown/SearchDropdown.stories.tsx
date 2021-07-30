import React, { useState } from 'react';

import SearchDropdown, { SearchDropdownSize } from './SearchDropdown';

export default {
  title: 'dls|SearchDropdown',
  component: SearchDropdown,
  argTypes: {
    selectorText: {
      table: {
        category: 'Required',
      },
      description:
        'The text shown on the selector area that when clicked toggles the visibility of the search dropdown body.',
    },
    id: {
      table: {
        category: 'Required',
      },
      description:
        'A unique identifier for the search dropdown. This is added to avoid collision when 2 search dropdowns are existent in the DOM.',
    },
    onSelect: {
      table: {
        category: 'Required',
      },
      description:
        'A function that will be called when an item is selected. The function will pass the name of the item selected along with id of the search dropdown.',
    },
    items: {
      table: {
        category: 'Required',
      },
      description:
        'The items of the search dropdown. Each item will have to have id, value, name, label and checked and disabled are itemal.',
    },
    selectedItem: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The value of "name" attribute of the selected item.',
    },
    size: {
      defaultValue: SearchDropdownSize.Medium,
      description: `The size of the search dropdown.`,
      items: Object.values(SearchDropdownSize).map((size) => size),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    showClearSearchIcon: {
      defaultValue: true,
      items: [true, false],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
      description:
        'Control showing the clear search icon. This is only used when we set allowSearching to true.',
    },
    allowSearching: {
      defaultValue: true,
      items: [true, false],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
      description: 'Whether we show the search input element or not.',
    },
    noResultText: {
      defaultValue: 'No results found.',
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
      description: 'The label of the search dropdown.',
    },
    searchPlaceHolder: {
      defaultValue: 'Type search query...',
      control: { type: 'text' },
      table: {
        category: 'Optional',
      },
      description: 'The placeholder of the search input.',
    },
  },
};

const Template = (args) => {
  const [selectedItem, setSelectedItem] = useState('Item2');

  const onSelect = (selectedName: string) => {
    setSelectedItem(selectedName);
  };
  return (
    <SearchDropdown
      {...args}
      selectedItem={selectedItem}
      selectorText={selectedItem}
      onSelect={onSelect}
    />
  );
};

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

export const DefaultSearchDropdown = Template.bind({});
DefaultSearchDropdown.args = {
  id: 'default',
  items: ITEMS,
};
