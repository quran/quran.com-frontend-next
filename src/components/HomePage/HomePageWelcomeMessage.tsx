/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import HomePageMessage from './HomePageMessage';

const HomePageWelcomeMessage = () => {
  const { t } = useTranslation('common');

  return (
    <HomePageMessage
      title={t('fundraising.title')}
      subtitle={t('fundraising.description')}
      body={null}
    />
  );
};

export default HomePageWelcomeMessage;
