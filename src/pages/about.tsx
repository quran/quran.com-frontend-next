import React from 'react';
import useTranslation from 'next-translate/useTranslation';

import Layout from '../components/Layout';

const About = () => {
  const { t } = useTranslation();
  const quranCom = t('common:Quran-com');
  const description = t('about:description');

  return (
    <Layout>
      <span>{quranCom}</span>
      <span>{description}</span>
    </Layout>
  );
};

export default About;
