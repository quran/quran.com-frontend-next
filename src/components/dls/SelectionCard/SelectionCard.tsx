/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import classNames from 'classnames';

import styles from './SelectionCard.module.scss';

import ChevronRightIcon from '@/icons/chevron-right.svg';
import { TestId } from '@/tests/test-ids';

type SelectionCard = {
  label?: string;
  value?: string;
  onClick?: () => void;
  className?: string;
  valueClassName?: string;
  labelClassName?: string;
};

const SelectionCard = ({
  label,
  value,
  onClick,
  className,
  valueClassName,
  labelClassName,
}: SelectionCard) => {
  return (
    <div
      className={classNames(styles.container, className)}
      onClick={onClick}
      data-testid={TestId.TRANSLATION_CARD}
    >
      <div className={styles.labelContainer}>
        <div className={classNames(styles.label, labelClassName)}>{label}</div>
        <div className={classNames(styles.value, valueClassName)}>{value}</div>
      </div>
      <div className={styles.iconContainer}>
        <ChevronRightIcon />
      </div>
    </div>
  );
};

export default SelectionCard;
