import classNames from 'classnames';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import styles from './Separator.module.scss';

export enum SeparatorOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

type SeparatorProps = {
  orientation: SeparatorOrientation;
};

const Separator = ({ orientation }: SeparatorProps) => (
  <SeparatorPrimitive.Separator orientation={orientation} className={classNames(styles.base)} />
);

export default Separator;
