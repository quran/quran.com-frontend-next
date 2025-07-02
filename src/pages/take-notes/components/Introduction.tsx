import React from 'react';

import Image from 'next/image';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/pages/contentPage.module.scss';

const Introduction: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <>
      <div className={styles.spacer} />
      <p>{t('introduction')}</p>
      <div className={styles.imageContainer}>
        <Image
          src="/images/take-notes/image-1.png"
          alt={t('images.feature-available.alt')}
          className={styles.contentImage}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: 'auto', height: 'auto' }}
        />
        <p className={styles.imageCaption}>{t('images.feature-available.caption')}</p>
      </div>
    </>
  );
};

export default Introduction;
