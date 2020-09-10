import React from 'react';
// import { Container, Row, Col } from 'styled-bootstrap-grid';
import useTranslation from 'next-translate/useTranslation';
// import Text from '../components/dls/Text/Text';
// import phones from '../../public/images/mockup-mobilex2.png';
import AppsPage from '../components/Pages/QuranApps/AppsPage';

const Apps = () => {
  const { t } = useTranslation();
  const quranCom = t('common:Quran-com');
  const description = t('apps:description');

  return <AppsPage title={quranCom} content={description} />;
};

export default Apps;
