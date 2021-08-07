import React from 'react';
import { NextSeo } from 'next-seo';
import useTranslation from 'next-translate/useTranslation';

const About = () => {
  const { t } = useTranslation();
  const quranCom = t('common:Quran-com');
  const description = t('about:description');

  return (
    <>
      <NextSeo title={t('about:title')} />
      <span>{quranCom}</span>
      <span>{description}</span>
    </>
  );
};

export default About;
