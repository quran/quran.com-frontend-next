import { FC } from 'react';

import Feature from './Feature';
import styles from './login.module.scss';

interface Benefit {
  id: string;
  label: string;
}

interface BenefitsSectionProps {
  benefits: Benefit[];
}

const BenefitsSection: FC<BenefitsSectionProps> = ({ benefits }) => (
  <div className={styles.benefits}>
    {benefits.map(({ id, label }) => (
      <Feature key={id} label={label} />
    ))}
  </div>
);

export default BenefitsSection;
