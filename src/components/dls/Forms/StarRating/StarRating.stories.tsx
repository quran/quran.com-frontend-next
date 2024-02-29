/* eslint-disable @typescript-eslint/no-empty-function */
import React, { useCallback, useState } from 'react';

import StarRating from '.';

export default {
  title: 'dls/StarRating',
  component: StarRating,
  args: {
    disabled: false,
  },
  argTypes: {
    disabled: {
      options: [true, false],
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description:
        'Control whether the radio group should be disabled or not. if it is disabled, every radio item will be disabled.',
    },
    defaultValue: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description:
        'The value of the radio item that should be checked when initially rendered. Use when the radio group is not controlled.',
    },
    value: {
      table: {
        category: 'Required',
      },
      control: { type: 'text' },
      description: 'The controlled value of the radio item to check.',
    },
    name: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The name of the group when submitted within a form.',
    },
    onChange: {
      table: {
        category: 'Optional',
      },
      description: 'An event handler that will be called when the value changes.',
    },
  },
};

const ControlledLocalTemplate = (args) => {
  const [value, setValue] = useState('5');
  const onChange = useCallback((newSelectedValue: string) => {
    setValue(newSelectedValue);
  }, []);

  return (
    <span className="previewWrapper">
      <StarRating value={value} onChange={onChange} {...args} />
    </span>
  );
};

export const DefaultStartRating = ControlledLocalTemplate.bind({});
DefaultStartRating.args = {};
