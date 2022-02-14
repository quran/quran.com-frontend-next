import * as SeparatorPrimitive from '@radix-ui/react-separator';
import classNames from 'classnames';

import styles from './Separator.module.scss';

type SeparatorProps = {
  isVertical?: boolean;
  className?: string;
};

const Separator = ({ isVertical = false, className }: SeparatorProps) => (
  <SeparatorPrimitive.Separator
    orientation={isVertical ? 'vertical' : 'horizontal'}
    className={classNames(styles.base, { [className]: className })}
  />
);

export default Separator;
