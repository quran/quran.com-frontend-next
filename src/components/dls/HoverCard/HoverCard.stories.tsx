import React from 'react';
import HoverCard, { ContentAlign, ContentSide } from '.';

export default {
  title: 'dls/HoverCard',
  component: HoverCard,
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
      defaultValue: ContentSide.BOTTOM,
      description: `The preferred side of the anchor to render against when open.`,
      options: Object.values(ContentSide).map((side) => side),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    contentAlign: {
      defaultValue: ContentAlign.CENTER,
      description: `The preferred alignment against the anchor.`,
      options: Object.values(ContentAlign).map((align) => align),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    avoidCollisions: {
      defaultValue: true,
      description: `When true, overrides the contentSide and contentAlign preferences to prevent collisions with window edges.`,
      options: [true, false],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    tip: {
      defaultValue: true,
      options: [true, false],
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
      description: 'Whether to show the tip arrow or not.',
    },
    openDelay: {
      defaultValue: 400,
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
      description:
        'The duration in milliseconds from when the mouse enters the trigger until the hover card opens.',
    },
    closeDelay: {
      defaultValue: 300,
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
  <div style={{ width: 150, marginLeft: 50 }}>
    <HoverCard {...args} />
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

export const HoverCardCollidesWithWindowEdges = Template.bind({});
HoverCardCollidesWithWindowEdges.args = {
  children: DefaultTrigger,
  body: Body,
  avoidCollisions: false,
  contentSide: ContentSide.LEFT,
  contentAlign: ContentAlign.CENTER,
};
