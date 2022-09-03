import Badge from '@/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from '@/dls/Button/Button';
import RepeatIcon from '@/icons/repeat.svg';

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
