import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from '@/pages/contentPage.module.scss';

const Conclusion: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <>
      <h3>{t('benefits.share-reflections.conclusion.title')}</h3>
      <p>{t('benefits.share-reflections.conclusion.paragraph1')}</p>
      <p>
        <Trans
          i18nKey="benefits.share-reflections.conclusion.paragraph2"
          components={[<span className={styles.boldText} key={0} />]}
          ns="take-notes"
        />
      </p>
      <p>{t('benefits.share-reflections.conclusion.dua')}</p>
    </>
  );
};

export default Conclusion;
