import { FC } from 'react';

import styles from './login.module.scss';

import useDirection from '@/hooks/useDirection';
import SunIcon from '@/icons/sun-login.svg';

interface Props {
  label: string;
}

const Feature: FC<Props> = ({ label }) => {
  const direction = useDirection();

  return (
    <div dir={direction} className={styles.benefit}>
      <div className={styles.benefitContent}>
        <SunIcon />
        <p className={styles.benefitText}>{label}</p>
      </div>
    </div>
  );
};

export default Feature;
