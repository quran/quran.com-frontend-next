import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import classNames from 'classnames';

import styles from './Item.module.scss';

interface Props extends RadioGroupPrimitive.RadioGroupItemProps {
  indicatorClassName?: string;
}

const Item = ({ className, indicatorClassName, ...props }: Props) => (
  <RadioGroupPrimitive.Item className={classNames(styles.radioItem, className)} {...props}>
    <RadioGroupPrimitive.Indicator className={classNames(styles.indicator, indicatorClassName)} />
  </RadioGroupPrimitive.Item>
);

export default Item;
