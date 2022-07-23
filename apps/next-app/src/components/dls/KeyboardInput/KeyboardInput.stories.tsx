import React from 'react';

import KeyboardInput from '.';

export default {
  title: 'dls/KeyboardInput',
  component: KeyboardInput,
  argTypes: {
    keyboardKey: {
      description: 'the keyboard key.',
      table: { category: 'Optional' },
      control: { type: 'text' },
    },
    meta: {
      description: 'whether META (cmd in MAC) modifier should be shown',
      table: { category: 'Optional' },
      defaultValue: false,
      control: { type: 'boolean' },
    },
    shift: {
      description: 'whether SHIFT modifier should be shown',
      table: { category: 'Optional' },
      defaultValue: false,
      control: { type: 'boolean' },
    },
    alt: {
      description: 'whether ALT modifier should be shown',
      table: { category: 'Optional' },
      defaultValue: false,
      control: { type: 'boolean' },
    },
    ctrl: {
      description: 'whether CTRL modifier should be shown',
      table: { category: 'Optional' },
      defaultValue: false,
      control: { type: 'boolean' },
    },
  },
};

const Template = (args) => <KeyboardInput {...args} />;

export const DefaultKeyboard = Template.bind({});
DefaultKeyboard.args = {
  keyboardKey: 'B',
};
export const WithMeta = Template.bind({});
WithMeta.args = {
  meta: true,
};
export const WithShift = Template.bind({});
WithShift.args = {
  shift: true,
};
export const WithAlt = Template.bind({});
WithAlt.args = {
  alt: true,
};
export const WithCtrl = Template.bind({});
WithCtrl.args = {
  ctrl: true,
};
export const WithMetaAndK = Template.bind({});
WithMetaAndK.args = {
  meta: true,
  keyboardKey: 'K',
};
export const WithAll = Template.bind({});
WithAll.args = {
  meta: true,
  shift: true,
  alt: true,
  ctrl: true,
  keyboardKey: 'T',
};
