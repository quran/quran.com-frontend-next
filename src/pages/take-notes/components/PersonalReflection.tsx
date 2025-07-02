import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import BenefitSection from './BenefitSection';

import styles from '@/pages/contentPage.module.scss';

const PersonalReflection: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <BenefitSection
      id="personal-reflection"
      number={1}
      title={t('benefits.personal-reflection.title')}
    >
      <p>{t('benefits.personal-reflection.description')}</p>
      <ul>
        {[
          { id: 'understand', text: t('benefits.personal-reflection.bullet-points.0') },
          { id: 'connect', text: t('benefits.personal-reflection.bullet-points.1') },
        ].map(({ id, text }) => (
          <li key={`pr-${id}`}>{text}</li>
        ))}
      </ul>
      <div className={styles.spacer} />
      <p>{t('benefits.personal-reflection.examples-heading')}</p>
      <div className={styles.imageContainer}>
        <Image
          src="/images/take-notes/image-4.png"
          alt={t('benefits.personal-reflection.images.reflection')}
          className={styles.contentImage}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>
      <div className={styles.imageContainer}>
        <Image
          src="/images/take-notes/image-5.png"
          alt={t('benefits.personal-reflection.images.growth')}
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

export default PersonalReflection;
