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
import { logButtonClick } from '@/utils/eventLogger';

const HomePageWelcomeMessage = () => {
  const { t } = useTranslation('common');

  const { isVisible } = useSelector(selectWelcomeMessage, shallowEqual);
  const dispatch = useDispatch();

  const onClose = () => {
    logButtonClick('homepage_welcome_message_close');
    dispatch(setIsWelcomeMessageVisible(false));
  };

  if (!isVisible) return null;

  return <HomePageMessage subtitle={t('fundraising.description')} body={null} onClose={onClose} />;
};

export default HomePageWelcomeMessage;
