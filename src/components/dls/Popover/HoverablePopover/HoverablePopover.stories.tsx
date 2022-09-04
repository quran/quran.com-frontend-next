import React from 'react';

import HoverablePopover from '.';

import { ContentSide } from '@/dls/Popover';

export default {
  title: 'dls/Popover/Hoverable',
  component: HoverablePopover,
  args: {
    defaultValue: ContentSide.TOP,
    tip: true,
    tooltipDelay: 0,
  },
  argTypes: {
    content: {
      description: 'This is the content that will show inside the Tooltip and the Popover.',
      table: {
        category: 'Required',
      },
    },
    children: {
      description: 'The content of the Tooltip.',
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
    onOpenChange: {
      table: {
        category: 'Optional',
      },
      description: 'This is a callback to handle when the visibility changes.',
    },
    tip: {
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Whether to show the tip arrow or not.',
    },
    tooltipDelay: {
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
      description:
        'The duration in milliseconds from when the mouse enters the trigger until the Tooltip opens.',
    },
    defaultStyling: {
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
  },
};

const Template = (args) => (
  <div style={{ margin: 100 }}>
    <HoverablePopover {...args} />
  </div>
);
const Content = <div>Hoverable Popover Content</div>;
const DefaultTrigger = <button type="button">Toggle</button>;

export const DefaultPopover = Template.bind({});
DefaultPopover.args = {
  children: DefaultTrigger,
  content: Content,
};
