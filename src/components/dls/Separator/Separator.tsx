import * as SeparatorPrimitive from '@radix-ui/react-separator';
import classNames from 'classnames';

import styles from './Separator.module.scss';

export enum SeparatorWeight {
  Bold = 'bold',
  SemiBold = 'semiBold',
}

type SeparatorProps = {
  isVertical?: boolean;
  className?: string;
  weight?: SeparatorWeight;
};

const Separator = ({
  isVertical = false,
  className,
  weight = SeparatorWeight.SemiBold,
}: SeparatorProps) => (
  <SeparatorPrimitive.Separator
    orientation={isVertical ? 'vertical' : 'horizontal'}
    className={classNames(styles.base, styles[weight], {
      [className]: className,
    })}
  />
);

export default Separator;
