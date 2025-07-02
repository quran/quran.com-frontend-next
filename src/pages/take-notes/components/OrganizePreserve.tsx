import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import BenefitSection from './BenefitSection';

import styles from '@/pages/contentPage.module.scss';

const OrganizePreserve: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <BenefitSection id="organize-preserve" number={2} title={t('benefits.organize-preserve.title')}>
      <p>{t('benefits.organize-preserve.paragraph')}</p>
      <div className={styles.imageContainer}>
        <Image
          src="/images/take-notes/image-6.png"
          alt={t('benefits.organize-preserve.images.organized')}
          className={styles.contentImage}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>
      <div className={styles.imageContainer}>
        <Image
          src="/images/take-notes/image-7.png"
          alt={t('benefits.organize-preserve.images.preserved')}
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

export default OrganizePreserve;
