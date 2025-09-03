import React from 'react';

import Image from 'next/image';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/pages/contentPage.module.scss';

const HowToUse: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <>
      <h3>{t('how-to-use.title')}</h3>
      <ol className={styles.decimalList}>
        {[
          { key: 'step1', id: 'how-to-use-step-1' },
          { key: 'step2', id: 'how-to-use-step-2' },
          { key: 'step3', id: 'how-to-use-step-3' },
          { key: 'step4', id: 'how-to-use-step-4' },
        ].map(({ key, id }) => (
          <li key={id}>
            <Trans
              i18nKey={`how-to-use.${key}`}
              ns="take-notes"
              components={[<strong key="0" />]}
            />
          </li>
        ))}
      </ol>
      <div className={styles.imageContainer}>
        <Image
          src="/images/take-notes/image-2.png"
          alt={t('images.adding-notes.alt')}
          className={styles.contentImage}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>
      <p>{t('how-to-use.saved-note-explanation')}</p>
      <div className={styles.imageContainer}>
        <Image
          src="/images/take-notes/image-3.png"
          alt={t('images.blue-icon.alt')}
          className={styles.contentImage}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: 'auto', height: 'auto' }}
        />
      </div>
    </>
  );
};

export default HowToUse;
