// eslint-disable-next-line import/no-extraneous-dependencies
import { Story } from '@storybook/react';
import React from 'react';

import ButtonNew, { ButtonNewProps } from './ButtonNew';

export default {
  title: 'dls/Button',
  component: ButtonNew,
};

const Template: Story<ButtonNewProps> = (args) => <ButtonNew {...args}>some text here</ButtonNew>;

export const DefaultButton = Template.bind({});
DefaultButton.args = {};

export const LoadingButton = Template.bind({});
DefaultButton.args = {
  loading: true,
};
