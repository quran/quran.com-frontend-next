import React from 'react';
import Button, { ButtonSize } from './Button';
import IconLogo from '../../../../public/icons/Logo.svg';

export default {
  title: 'dls|Buttons',
  component: Button,
  argTypes: {
    size: {
      defaultValue: ButtonSize.Medium,
      description: `The size of the button`,
      table: {
        category: 'Optional',
      },
      options: Object.values(ButtonSize).map((size) => size),
      control: { type: 'radio' },
    },
    disabled: {
      defaultValue: false,
      description: `Whether the button is disabled or not.`,
      table: {
        category: 'Optional',
      },
      options: [true, false],
      control: { type: 'radio' },
    },
    text: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The text inside the button.',
    },
    name: {
      table: {
        category: 'Optional',
      },
      control: { type: 'text' },
      description: 'The name of the button.',
    },
    onClick: {
      table: {
        category: 'Optional',
      },
      description: 'A handler for when the button is clicked.',
    },
    href: {
      table: {
        category: 'Optional',
      },
      description: 'When present, the button will act like an anchor that navigate to the href.',
    },
    icon: {
      table: {
        category: 'Optional',
      },
      description: 'The icon inside the button.',
    },
  },
};

const Template = (args) => <Button icon={<IconLogo />} {...args} />;

export const DefaultButton = Template.bind({});
DefaultButton.args = {};
