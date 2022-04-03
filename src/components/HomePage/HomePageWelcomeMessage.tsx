/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';

import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import HomePageMessage from './HomePageMessage';

import {
  selectWelcomeMessage,
  setIsVisible as setIsWelcomeMessageVisible,
} from 'src/redux/slices/welcomeMessage';

const HomePageWelcomeMessage = () => {
  const { t } = useTranslation('home');
  const { isVisible } = useSelector(selectWelcomeMessage, shallowEqual);
  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(setIsWelcomeMessageVisible(false));
  };

  if (!isVisible) return null;

  return (
    <HomePageMessage
      title={t('home:welcome.title')}
      body={
        <Trans
          i18nKey="home:welcome.body"
          components={[
            <a href="https://donate.quran.com" target="_blank" rel="noreferrer" key="0" />,
            <br key="1" />,
            <br key="2" />,
          ]}
        />
      }
      onClose={onClose}
    />
  );
};

export default HomePageWelcomeMessage;
