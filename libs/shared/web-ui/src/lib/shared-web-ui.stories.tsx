import { ComponentStory, ComponentMeta } from '@storybook/react';
import { SharedWebUi } from './shared-web-ui';

export default {
  component: SharedWebUi,
  title: 'SharedWebUi',
} as ComponentMeta<typeof SharedWebUi>;

const Template: ComponentStory<typeof SharedWebUi> = (args) => (
  <SharedWebUi {...args} />
);

export const Primary = Template.bind({});
Primary.args = {};
