/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import styles from './SelectionCard.module.scss';

import ChevronRightIcon from '@/icons/chevron-right.svg';
import { TestId } from '@/tests/test-ids';

type SelectionCard = {
  label?: string;
  value?: string;
  onClick?: () => void;
};

const SelectionCard = ({ label, value, onClick }: SelectionCard) => {
  return (
    <div className={styles.container} onClick={onClick} data-testid={TestId.TRANSLATION_CARD}>
      <div className={styles.labelContainer}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
      </div>
      <div className={styles.iconContainer}>
        <ChevronRightIcon />
      </div>
    </div>
  );
};

export default SelectionCard;
