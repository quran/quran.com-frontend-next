/* eslint-disable react/no-multi-comp */
import { useCallback, useState } from 'react';

import Toggle from './Toggle';

export default {
  title: 'dls/Toggle',
  component: Toggle,
  args: {
    isDefaultChecked: true,
    isDisabled: false,
    id: 'toggle',
  },

  argTypes: {
    label: {
      control: {
        type: 'text',
      },
      description: 'The label of the toggle',
      table: {
        category: 'Optional',
      },
    },
    onChange: {
      table: {
        category: 'Optional',
      },
      description: 'This is a callback to handle when the value changes.',
    },
    isDisabled: {
      description: 'Whether the toggle is disabled or not.',
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
    isRequired: {
      description: 'Whether the toggle is required.',
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
    isDefaultChecked: {
      table: {
        category: 'Optional',
      },
      control: { type: 'boolean' },
      description: 'Whether the default is checked or not.',
    },
    isChecked: {
      table: {
        category: 'Optional',
      },
      control: { type: 'boolean' },
      description: 'Controlled checked value.',
    },
    name: {
      control: { type: 'text' },
      table: {
        category: 'Optional',
      },
      description: 'The name of the toggle if inside a form.',
    },
    id: {
      control: { type: 'text' },
      description: 'The Id of the toggle.',
    },
  },
};

const Template = (args) => {
  return <Toggle {...args} />;
};

export const DefaultToggle = Template.bind({});

const ControlledTemplate = (args) => {
  const [checked, setChecked] = useState(true);
  const onChange = useCallback((newValue: boolean) => {
    setChecked(newValue);
  }, []);
  return <Toggle {...args} isChecked={checked} onChange={onChange} />;
};
export const ControlledToggle = ControlledTemplate.bind({});
ControlledToggle.args = {};
