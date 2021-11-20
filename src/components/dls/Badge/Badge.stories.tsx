import RepeatIcon from '../../../../public/icons/repeat.svg';

import Badge from 'src/components/dls/Badge/Badge';
import Button, { ButtonShape, ButtonVariant } from 'src/components/dls/Button/Button';

export default {
  title: 'dls/Badge',
};

export const DefaultBadge = () => (
  <Badge content="1">
    <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle}>
      <RepeatIcon />
    </Button>
  </Badge>
);
