import React, { ReactNode } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from '@/pages/contentPage.module.scss';
import { toLocalizedNumber } from '@/utils/locale';

interface BenefitSectionProps {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}

const BenefitSection: React.FC<BenefitSectionProps> = ({ id, number, title, children }) => {
  const { lang } = useTranslation('take-notes');
  return (
    <>
      <div className={styles.spacer} />
      <h4 id={id}>
        {toLocalizedNumber(number, lang)}. {title}
      </h4>
      {children}
    </>
  );
};

export default BenefitSection;
