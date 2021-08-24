import React from 'react';
import ButtonNew, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from './ButtonNew';
import SettingIcon from '../../../../public/icons/settings.svg';

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
    variant: {
      description: `[OPTIONAL] The color of the button. by default primary`,
      options: [...Object.values(ButtonVariant), null],
      control: { type: 'select' },
    },
    disabled: {
      defaultValue: false,
      description: `[OPTIONAL] indicate whether the button is disabled or not`,
      options: [true, false],
      control: { type: 'radio' },
    },
    loading: {
      defaultValue: false,
      description: `[OPTIONAL] indicate whether the button is in loading state or not`,
      options: [true, false],
      control: { type: 'radio' },
    },
    prefix: {
      description: `[OPTIONAL] icon prefix`,
    },
    suffix: {
      description: `[OPTIONAL] icon suffix`,
    },
  },
};

const Template = (args) => <ButtonNew {...args}>Upload</ButtonNew>;

export const DefaultButton = Template.bind({});
DefaultButton.args = {};

export const LoadingButton = Template.bind({});
LoadingButton.args = {
  loading: true,
};

export const ButtonSmall = Template.bind({});
ButtonSmall.args = {
  size: ButtonSize.Small,
};

export const WithIconPrefix = Template.bind({});
WithIconPrefix.args = {
  prefix: <SettingIcon />,
};

export const WithIconLoading = Template.bind({});
WithIconLoading.args = {
  prefix: <SettingIcon />,
  loading: true,
};

export const WithIconSuffix = Template.bind({});
WithIconSuffix.args = {
  suffix: <SettingIcon />,
};

const TemplateIcon = (args) => (
  <ButtonNew {...args}>
    <SettingIcon />
  </ButtonNew>
);

export const Icon = TemplateIcon.bind({});

export const IconGhost = TemplateIcon.bind({});
IconGhost.args = {
  variant: ButtonVariant.Ghost,
};
