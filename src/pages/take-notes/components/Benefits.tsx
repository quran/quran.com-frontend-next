import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import AccessAnywhere from './AccessAnywhere';
import EnhancedMemorization from './EnhancedMemorization';
import OrganizePreserve from './OrganizePreserve';
import PersonalReflection from './PersonalReflection';
import ShareReflections from './ShareReflections';

import styles from '@/pages/contentPage.module.scss';

const Benefits: React.FC = () => {
  const { t } = useTranslation('take-notes');

  return (
    <>
      <h3 id="benefits">{t('benefits.title')}</h3>
      <div className={styles.spacer} />
      <PersonalReflection />
      <OrganizePreserve />
      <AccessAnywhere />
      <EnhancedMemorization />
      <ShareReflections />
    </>
  );
};

export default Benefits;
