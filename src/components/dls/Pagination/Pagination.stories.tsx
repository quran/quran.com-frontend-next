import React, { useState } from 'react';

import Pagination from './Pagination';

export default {
  title: 'dls/Pagination',
  component: Pagination,
  args: {
    pageSize: 20,
    siblingsCount: 1,
    showSummary: true,
  },
  argTypes: {
    totalCount: {
      description: `The total number of items for all pages.`,
      table: {
        category: 'Required',
      },
      control: { type: 'number' },
    },
    currentPage: {
      description: `The current active page.`,
      table: {
        category: 'Required',
      },
      control: { type: 'number' },
    },
    onPageChange: {
      table: {
        category: 'Required',
      },
      description:
        'A function that will handle once a page navigation action is trigger, either to a specific page number, the previous page or the next page.',
    },
    pageSize: {
      description: `The number of items for each page. Defaults to 20.`,
      table: {
        category: 'Optional',
      },
      control: { type: 'number' },
    },
    siblingsCount: {
      description: `The maximum number of pages to be shown to the right and the left of the current active page.`,
      table: {
        category: 'Optional',
      },
      control: { type: 'number' },
    },
    showSummary: {
      description: `Whether we should show the summary of the pagination like which range are we currently showing and the total.`,
      table: {
        category: 'Optional',
      },
      control: { type: 'boolean' },
    },
  },
};

const Template = (args) => {
  const [currentPage, setCurrentPage] = useState(1);
  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };
  return <Pagination {...args} currentPage={currentPage} onPageChange={onPageChange} />;
};

export const DefaultPagination = Template.bind({});
DefaultPagination.args = {
  totalCount: 1000,
  currentPage: 1,
};
