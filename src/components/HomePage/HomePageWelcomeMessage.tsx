/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';

import HomePageMessage from './HomePageMessage';

import {
  selectWelcomeMessage,
  setIsVisible as setIsWelcomeMessageVisible,
} from '@/redux/slices/welcomeMessage';

const HomePageWelcomeMessage = () => {
  const { t } = useTranslation('home');
  const { isVisible } = useSelector(selectWelcomeMessage, shallowEqual);
  const dispatch = useDispatch();

  const onClose = () => {
    dispatch(setIsWelcomeMessageVisible(false));
  };

  if (!isVisible) return null;

  return <HomePageMessage title={t('welcome.title')} body={null} onClose={onClose} />;
};

export default HomePageWelcomeMessage;
