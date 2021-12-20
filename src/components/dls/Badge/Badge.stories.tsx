import RepeatIcon from '../../../../public/icons/repeat.svg';

import Badge from 'src/components/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';

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
      <RepeatIcon />
    </Button>
  </Badge>
);

export const DefaultBadge = Template.bind({});
