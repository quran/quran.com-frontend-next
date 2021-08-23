import React from 'react';
import ButtonNew, { ButtonShape, ButtonSize, ButtonType } from './ButtonNew';

export default {
  title: 'dls/Button',
  component: ButtonNew,
  argTypes: {
    size: {
      defaultValue: ButtonSize.Normal,
      description: `[OPTIONAL] The size of the button`,
      options: Object.values(ButtonSize),
      control: { type: 'radio' },
    },
    shape: {
      defaultValue: ButtonShape.Square,
      description: `[OPTIONAL] The shape of the button. By default square`,
      options: Object.values(ButtonShape),
      control: { type: 'radio' },
    },
    type: {
      defaultValue: ButtonType.Primary,
      description: `[OPTIONAL] The color of the button. by default primary`,
      options: Object.values(ButtonType),
      control: { type: 'select' },
    },
  },
};

const Template = (args) => <ButtonNew {...args}>some text here</ButtonNew>;

export const DefaultButton = Template.bind({});
DefaultButton.args = {};

export const LoadingButton = Template.bind({});
DefaultButton.args = {
  loading: true,
};

export const ButtonSmall = Template.bind({});
DefaultButton.args = {};
