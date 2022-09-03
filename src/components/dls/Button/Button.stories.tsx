import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from './Button';

import SettingIcon from '@/icons/settings.svg';

export default {
  title: 'dls/Button',
  component: Button,
  args: {
    size: ButtonSize.Medium,
    type: ButtonType.Primary,
    disabled: false,
    loading: false,
    hasSidePadding: true,
  },
  argTypes: {
    size: {
      description: `[OPTIONAL] The size of the button`,
      options: Object.values(ButtonSize),
      control: { type: 'radio' },
    },
    shape: {
      description: `[OPTIONAL] The shape of the button. By default square`,
      options: Object.values(ButtonShape),
      control: { type: 'radio' },
    },
    type: {
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
    hasSidePadding: {
      options: [true, false],
      control: { type: 'radio' },
    },
  },
};

const Template = (args) => <Button {...args}>Upload</Button>;

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

// eslint-disable-next-line react/no-multi-comp
const TemplateIcon = (args) => (
  <Button {...args}>
    <SettingIcon />
  </Button>
);

export const Icon = TemplateIcon.bind({});

export const IconGhost = TemplateIcon.bind({});
IconGhost.args = {
  variant: ButtonVariant.Ghost,
};

export const IconCircle = TemplateIcon.bind({});
IconCircle.args = {
  shape: ButtonShape.Circle,
};
