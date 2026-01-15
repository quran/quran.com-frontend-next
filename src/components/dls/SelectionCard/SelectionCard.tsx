/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import classNames from 'classnames';

import styles from './SelectionCard.module.scss';

import ChevronRightIcon from '@/icons/chevron-right.svg';

type SelectionCard = {
  label?: string;
  value?: string;
  onClick?: () => void;
  className?: string;
  valueClassName?: string;
};

const SelectionCard = ({ label, value, onClick, className, valueClassName }: SelectionCard) => {
  return (
    <div className={classNames(styles.container, className)} onClick={onClick}>
      <div className={styles.labelContainer}>
        <div className={styles.label}>{label}</div>
        <div className={classNames(styles.value, valueClassName)}>{value}</div>
      </div>
      <div className={styles.iconContainer}>
        <ChevronRightIcon />
      </div>
    </div>
  );
};

export default SelectionCard;
