import React from 'react';
import useTranslation from 'next-translate/useTranslation';
import Text from '../components/dls/Text/Text';

const About = () => {
  const { t } = useTranslation();
  const quranCom = t('common:Quran-com');
  const description = t('about:description');

  return (
    <>
      <Text large primary>
        {quranCom}
      </Text>
      <Text>{description}</Text>
    </>
  );
};

export default About;
