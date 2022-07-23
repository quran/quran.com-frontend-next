/* eslint-disable max-lines */
import React from 'react';

import Tooltip, { ContentAlign, ContentSide, TooltipType } from '.';

export default {
  title: 'dls/Tooltip',
  component: Tooltip,
  args: {
    contentSide: ContentSide.BOTTOM,
    contentAlign: ContentAlign.CENTER,
    avoidCollisions: true,
    invertColors: true,
    centerText: true,
    open: undefined,
    tip: true,
    delay: 400,
  },
  argTypes: {
    children: {
      description:
        'This is the ReactNode that when clicked we change the visibility of the overlay.',
      table: {
        category: 'Required',
      },
    },
    text: {
      description: 'The button that toggles the tooltip.',
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
    type: {
      description: `The type of the tooltip`,
      options: Object.values(TooltipType).map((type) => type),
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
    invertColors: {
      description: `Whether we should invert background color or not.`,
      defaultValue: true,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
    centerText: {
      description: `Whether we should center the tooltip text or not.`,
      defaultValue: true,
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
    open: {
      defaultValue: true,
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
    delay: {
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
      description:
        'The duration in milliseconds from when the mouse enters the trigger until the tooltip opens.',
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
  <span className="previewWrapper">
    <Tooltip {...args} />
  </span>
);
const LongText = 'This is a very very very very very very very very very long text';
const Text = 'Tooltip!';
const DefaultTrigger = <p>Hover to show</p>;

export const DefaultTooltip = Template.bind({});
DefaultTooltip.args = {
  children: DefaultTrigger,
  text: Text,
};

export const TooltipWithLongText = Template.bind({});
TooltipWithLongText.args = {
  children: DefaultTrigger,
  text: LongText,
};

export const TooltipWithoutCenteredText = Template.bind({});
TooltipWithoutCenteredText.args = {
  children: DefaultTrigger,
  text: LongText,
  centerText: false,
};

export const TooltipWithoutInvertedColors = Template.bind({});
TooltipWithoutInvertedColors.args = {
  children: DefaultTrigger,
  text: Text,
  invertColors: false,
};
export const TooltipWithoutDelay = Template.bind({});
TooltipWithoutDelay.args = {
  children: DefaultTrigger,
  text: LongText,
  delay: false,
};

export const SuccessTooltip = Template.bind({});
SuccessTooltip.args = {
  children: DefaultTrigger,
  text: Text,
  type: TooltipType.SUCCESS,
};

export const ErrorTooltip = Template.bind({});
ErrorTooltip.args = {
  children: DefaultTrigger,
  text: Text,
  type: TooltipType.ERROR,
};

export const WarningTooltip = Template.bind({});
WarningTooltip.args = {
  children: DefaultTrigger,
  text: Text,
  type: TooltipType.WARNING,
};

export const SecondaryTooltip = Template.bind({});
SecondaryTooltip.args = {
  children: DefaultTrigger,
  text: Text,
  type: TooltipType.SECONDARY,
};

export const TooltipWithoutTip = Template.bind({});
TooltipWithoutTip.args = {
  children: DefaultTrigger,
  text: Text,
  tip: false,
};

export const ControlledTooltip = Template.bind({});
ControlledTooltip.args = {
  children: <p>Hovering away will not close the tooltip</p>,
  text: Text,
  open: true,
};

export const TooltipCollidesWithWindowEdges = Template.bind({});
TooltipCollidesWithWindowEdges.args = {
  children: DefaultTrigger,
  text: Text,
  avoidCollisions: false,
  contentSide: ContentSide.LEFT,
  contentAlign: ContentAlign.CENTER,
};
