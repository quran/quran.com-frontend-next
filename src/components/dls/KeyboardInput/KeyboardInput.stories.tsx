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
    hasMeta: {
      description: 'whether META (cmd in MAC) modifier should be shown',
      table: { category: 'Optional' },
      defaultValue: false,
      control: { type: 'boolean' },
    },
    hasShift: {
      description: 'whether SHIFT modifier should be shown',
      table: { category: 'Optional' },
      defaultValue: false,
      control: { type: 'boolean' },
    },
    hasAlt: {
      description: 'whether ALT modifier should be shown',
      table: { category: 'Optional' },
      defaultValue: false,
      control: { type: 'boolean' },
    },
    hasCtrl: {
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
  hasMeta: true,
};
export const WithShift = Template.bind({});
WithShift.args = {
  hasShift: true,
};
export const WithAlt = Template.bind({});
WithAlt.args = {
  hasAlt: true,
};
export const WithCtrl = Template.bind({});
WithCtrl.args = {
  hasCtrl: true,
};
export const WithMetaAndK = Template.bind({});
WithMetaAndK.args = {
  hasMeta: true,
  keyboardKey: 'K',
};
export const WithAll = Template.bind({});
WithAll.args = {
  hasMeta: true,
  hasShift: true,
  hasAlt: true,
  hasCtrl: true,
  keyboardKey: 'T',
};
