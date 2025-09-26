import React from 'react';

import Popover, { ContentAlign, ContentSide } from '.';

export default {
  title: 'dls/Popover/Default',
  component: Popover,
  args: {
    contentSide: ContentSide.BOTTOM,
    hasTip: false,
    shouldUseTooltipStyles: false,
    contentAlign: ContentAlign.CENTER,
    shouldAvoidCollisions: true,
    isOpen: undefined,
    isModal: false,
  },
  argTypes: {
    children: {
      description:
        'This is the ReactNode that when clicked we change the visibility of the overlay.',
      table: {
        category: 'Required',
      },
    },
    trigger: {
      description: 'The button that toggles the popover.',
      table: {
        category: 'Required',
      },
    },
    contentSide: {
      description: `The preferred side of the anchor to render against when open.`,
      options: Object.values(ContentSide).map((side) => side),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    hasTip: {
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Whether to show the tip arrow or not.',
    },
    shouldUseTooltipStyles: {
      control: { type: 'boolean' },
      defaultValue: false,
      table: {
        category: 'Optional',
      },
      description:
        'Whether to set the styling of the content of the popover the same as the styling of the Tooltip or not.',
    },
    contentAlign: {
      description: `The preferred alignment against the anchor.`,
      options: Object.values(ContentAlign).map((align) => align),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    shouldAvoidCollisions: {
      description: `When true, overrides the contentSide and contentAlign preferences to prevent collisions with window edges.`,
      defaultValue: true,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
    isOpen: {
      defaultValue: false,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description:
        'This is to control the visibility of the overlay programmatically. onOpenChange will be ignored in that case.',
    },
    isModal: {
      defaultValue: false,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description:
        'The modality of the popover. When set to true, interaction with outside elements will be disabled and only popover content will be visible to screen readers.',
    },
    onOpenChange: {
      table: {
        category: 'Optional',
      },
      description: 'This is a callback to handle when the visibility changes.',
    },
  },
};

const Template = (args) => <Popover {...args} />;
const Overlay = <div>Popover content</div>;
const DefaultTrigger = <button type="button">Toggle</button>;

export const DefaultPopover = Template.bind({});
DefaultPopover.args = {
  trigger: DefaultTrigger,
  children: Overlay,
};

export const ControlledPopover = Template.bind({});
ControlledPopover.args = {
  trigger: <button type="button">Clicking me will not change open/close status status</button>,
  children: Overlay,
  isOpen: true,
};

export const PopoverCollidesWithWindowEdges = Template.bind({});
PopoverCollidesWithWindowEdges.args = {
  trigger: DefaultTrigger,
  children: Overlay,
  shouldAvoidCollisions: false,
  contentSide: ContentSide.LEFT,
  contentAlign: ContentAlign.END,
};
