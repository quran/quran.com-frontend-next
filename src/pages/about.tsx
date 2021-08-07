import React from 'react';
import useTranslation from 'next-translate/useTranslation';
import NextSeoHead from 'src/components/NextSeoHead';

const About = () => {
  const { t } = useTranslation();
  const quranCom = t('common:Quran-com');
  const description = t('about:description');

  return (
    <>
      <NextSeoHead title={t('about:title')} />
      <span>{quranCom}</span>
      <span>{description}</span>
    </>
  );
};

export default About;
