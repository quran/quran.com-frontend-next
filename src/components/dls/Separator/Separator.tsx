import * as SeparatorPrimitive from '@radix-ui/react-separator';
import classNames from 'classnames';

import styles from './Separator.module.scss';

type SeparatorProps = {
  isVertical?: boolean;
  isTranslationView?: boolean;
};

const Separator = ({ isVertical = false, isTranslationView = false }: SeparatorProps) => (
  <SeparatorPrimitive.Separator
    orientation={isVertical ? 'vertical' : 'horizontal'}
    className={isTranslationView ? classNames(styles.faded) : classNames(styles.base)}
  />
);

export default Separator;
