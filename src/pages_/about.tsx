import React from 'react';
import useTranslation from 'next-translate/useTranslation';

const About = () => {
  const { t } = useTranslation();
  const quranCom = t('common:Quran-com');
  const description = t('about:description');

  return (
    <>
      <span>{quranCom}</span>
      <span>{description}</span>
    </>
  );
};

export default About;
