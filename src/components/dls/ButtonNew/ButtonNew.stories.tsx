import React from 'react';
import ButtonNew from './ButtonNew';

export default {
  title: 'dls/Button',
  component: ButtonNew,
};

const Template = (args) => <ButtonNew {...args}>some text here</ButtonNew>;

export const DefaultButton = Template.bind({});
DefaultButton.args = {};

export const LoadingButton = Template.bind({});
DefaultButton.args = {
  loading: true,
};
