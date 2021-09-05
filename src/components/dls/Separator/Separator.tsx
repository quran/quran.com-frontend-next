import classNames from 'classnames';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import styles from './Separator.module.scss';

type SeparatorProps = {
  vertical?: boolean;
};

const Separator = ({ vertical = false }: SeparatorProps) => (
  <SeparatorPrimitive.Separator
    orientation={vertical ? 'vertical' : 'horizontal'}
    className={classNames(styles.base)}
  />
);

export default Separator;
