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
        'A function that will be called when an option is selected. The function will pass the name of the option selected along with id of the search dropdown.',
    },
    options: {
      table: {
        category: 'Required',
      },
      description:
        'The options of the search dropdown. Each option will have to have id, value, name, label and checked and disabled are optional.',
    },
    selectedOption: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The value of "name" attribute of the selected option.',
    },
    size: {
      defaultValue: SearchDropdownSize.Medium,
      description: `The size of the search dropdown.`,
      options: Object.values(SearchDropdownSize).map((size) => size),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    showClearSearchIcon: {
      defaultValue: true,
      options: [true, false],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
      description:
        'Control showing the clear search icon. This is only used when we set allowSearching to true.',
    },
    allowSearching: {
      defaultValue: true,
      options: [true, false],
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
      description: 'The text that shows when no options match the search query.',
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
  const [selectedOption, setSelectedOption] = useState('Option2');

  const onSelect = (selectedName: string) => {
    setSelectedOption(selectedName);
  };
  return (
    <SearchDropdown
      {...args}
      selectedOption={selectedOption}
      selectorText={selectedOption}
      onSelect={onSelect}
    />
  );
};

const OPTIONS = [
  {
    id: 'Option1',
    name: 'Option1',
    value: 'Option1',
    label: 'Option 1',
  },
  {
    id: 'Option2',
    name: 'Option2',
    value: 'Option2',
    label: 'Option 2',
  },
];

export const DefaultSearchDropdown = Template.bind({});
DefaultSearchDropdown.args = {
  id: 'default',
  options: OPTIONS,
};
