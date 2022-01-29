import React from 'react';

import ClickableHoverCard, { ContentAlign, ContentSide } from '.';

export default {
  title: 'dls/HoverCard/ClickableHoverCard',
  component: ClickableHoverCard,
  args: {
    contentSide: ContentSide.BOTTOM,
    contentAlign: ContentAlign.CENTER,
    avoidCollision: true,
    open: undefined,
    tip: true,
    openDelay: 400,
    closeDelay: 300,
  },
  argTypes: {
    children: {
      description: 'This is the ReactNode that when hovered over, we open the card.',
      table: {
        category: 'Required',
      },
    },
    body: {
      description: 'The component that pops out when the hover card is open.',
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
    contentAlign: {
      description: `The preferred alignment against the anchor.`,
      options: Object.values(ContentAlign).map((align) => align),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    avoidCollisions: {
      description: `When true, overrides the contentSide and contentAlign preferences to prevent collisions with window edges.`,
      defaultValue: true,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
    open: {
      defaultValue: false,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description:
        'This is to control the visibility of the overlay programmatically. onOpenChange will be ignored in that case.',
    },
    tip: {
      defaultValue: true,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
      description: 'Whether to show the tip arrow or not.',
    },
    openDelay: {
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
      description:
        'The duration in milliseconds from when the mouse enters the trigger until the hover card opens.',
    },
    closeDelay: {
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
      description:
        'The duration in milliseconds from when the mouse leaves the trigger or content until the hover card closes.',
    },
    onOpenChange: {
      table: {
        category: 'Optional',
      },
      description: 'This is a callback to handle when the visibility changes.',
    },
  },
};

const Template = (args) => (
  <div style={{ width: 150, marginLeft: 50 }} className="previewWrapper">
    <ClickableHoverCard {...args} />
  </div>
);
const Body = 'Hover Card Body!';
const DefaultTrigger = <p style={{ textAlign: 'center' }}>Hover to show</p>;

export const DefaultHoverCard = Template.bind({});
DefaultHoverCard.args = {
  children: DefaultTrigger,
  body: Body,
};

export const HoverCardWithoutOpenDelay = Template.bind({});
HoverCardWithoutOpenDelay.args = {
  children: DefaultTrigger,
  body: Body,
  openDelay: false,
};

export const HoverCardWithoutCloseDelay = Template.bind({});
HoverCardWithoutCloseDelay.args = {
  children: DefaultTrigger,
  body: Body,
  closeDelay: false,
};

export const HoverCardWithoutOpenAndCloseDelay = Template.bind({});
HoverCardWithoutOpenAndCloseDelay.args = {
  children: DefaultTrigger,
  body: Body,
  openDelay: false,
  closeDelay: false,
};

export const HoverCardWithoutTip = Template.bind({});
HoverCardWithoutTip.args = {
  children: DefaultTrigger,
  body: Body,
  tip: false,
};

export const HoverCardControlledTooltip = Template.bind({});
HoverCardControlledTooltip.args = {
  children: DefaultTrigger,
  body: Body,
  open: true,
};

export const HoverCardCollidesWithWindowEdges = Template.bind({});
HoverCardCollidesWithWindowEdges.args = {
  children: DefaultTrigger,
  body: Body,
  avoidCollisions: false,
  contentSide: ContentSide.LEFT,
  contentAlign: ContentAlign.CENTER,
};
