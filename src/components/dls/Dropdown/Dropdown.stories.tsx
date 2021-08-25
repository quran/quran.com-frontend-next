import React from 'react';
import Dropdown, { Placement } from './Dropdown';

export default {
  title: 'dls/Dropdowns',
  component: Dropdown,
  argTypes: {
    placement: {
      defaultValue: Placement.BOTTOM,
      description: `[OPTIONAL] Where to place the overlay it can be placed to the bottom, top, right or left of the initiator.`,
      options: [Placement.BOTTOM, Placement.TOP, Placement.RIGHT, Placement.LEFT],
      control: { type: 'radio' },
      table: {
        category: 'Placements',
      },
    },
    visible: {
      defaultValue: undefined,
      options: [true, false],
      control: { type: 'select' },
      description:
        '[OPTIONAL] This is to control the visibility of the overlay programmatically. onVisibleChange will be ignored in that case.',
    },
    overlay: {
      description: '[REQUIRED] The content of the overlay. This can be any valid ReactNode.',
    },
    children: {
      description:
        '[REQUIRED] This is the ReactNode that when clicked we change the visibility of the overlay.',
    },
    overlayClassName: {
      defaultValue: '',
      description: '[OPTIONAL] This is to attach a custom className to the overlay.',
    },
    onVisibleChange: {
      table: {
        category: 'Events',
      },
      description: '[OPTIONAL] This is a callback to handle when the visibility changes.',
    },
  },
};

const Template = (args) => (
  <div style={{ margin: 150 }}>
    <Dropdown {...args} />
  </div>
);

const Overlay = <div style={{ width: 120, height: 120 }}>Overlay Content</div>;

export const DefaultDropdown = Template.bind({});
DefaultDropdown.args = {
  children: <button type="button">Click me to toggle visibility</button>,
  overlay: Overlay,
};

export const ControlledDropdown = Template.bind({});
ControlledDropdown.args = {
  children: <button type="button">Clicking me will not affect visibility status</button>,
  overlay: Overlay,
  visible: true,
};
