import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import classNames from 'classnames';

import styles from './Star.module.scss';

import StarIcon from '@/icons/star.svg';
import StarFilledIcon from '@/icons/star_filled.svg';

interface Props extends RadioGroupPrimitive.RadioGroupItemProps {
  currentValue: string;
}

const Star: React.FC<Props> = ({ className, ...props }) => {
  const { value, currentValue } = props;
  const starValue = Number(value);
  const isCurrentStarSelected = starValue <= Number(currentValue);
  return (
    <RadioGroupPrimitive.Item
      className={classNames(styles.starButton, className, {
        [styles.selected]: isCurrentStarSelected,
      })}
      {...props}
    >
      <VisuallyHidden>{`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}</VisuallyHidden>
      {isCurrentStarSelected ? (
        <StarFilledIcon width="30" height="30" />
      ) : (
        <StarIcon width="30" height="30" />
      )}
    </RadioGroupPrimitive.Item>
  );
};

export default Star;
