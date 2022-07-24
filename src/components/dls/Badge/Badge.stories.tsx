import { FiRepeat } from 'react-icons/fi';

import Badge from 'src/components/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'dls/Badge',
  argTypes: {
    content: {
      defaultValue: '1',
      options: ['2', '10', '123'],
      control: { type: 'select' },
    },
  },
};

const Template = (args) => (
  <Badge content="1" {...args}>
    <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
      <FiRepeat />
    </Button>
  </Badge>
);

export const DefaultBadge = Template.bind({});
