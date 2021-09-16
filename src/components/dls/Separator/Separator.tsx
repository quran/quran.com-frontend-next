import classNames from 'classnames';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import styles from './Separator.module.scss';

type SeparatorProps = {
  isVertical?: boolean;
};

const Separator = ({ isVertical = false }: SeparatorProps) => (
  <SeparatorPrimitive.Separator
    orientation={isVertical ? 'vertical' : 'horizontal'}
    className={classNames(styles.base)}
  />
);

export default Separator;
