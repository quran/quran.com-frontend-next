import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import BenefitSection from './BenefitSection';

import styles from '@/pages/contentPage.module.scss';

const EnhancedMemorization: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <BenefitSection
      id="enhanced-memorization"
      number={4}
      title={t('benefits.enhanced-memorization.title')}
    >
      <p>{t('benefits.enhanced-memorization.paragraph')}</p>
      <ul>
        {[
          { id: 'active', text: t('benefits.enhanced-memorization.bullet-points.0') },
          { id: 'revisit', text: t('benefits.enhanced-memorization.bullet-points.1') },
          { id: 'reinforce', text: t('benefits.enhanced-memorization.bullet-points.2') },
        ].map(({ id, text }) => (
          <li key={`em-${id}`}>{text}</li>
        ))}
      </ul>
      <div className={styles.imageContainer}>
        <Image
          src="/images/take-notes/image-8.png"
          alt={t('benefits.enhanced-memorization.image.alt')}
          className={styles.contentImage}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>
    </BenefitSection>
  );
};

export default EnhancedMemorization;
