import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import CloseIcon from '../../../public/icons/close.svg';
// import InfoIcon from '../../../public/icons/info.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

import styles from './HomePageWelcomeMessage.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import {
  selectWelcomeMessage,
  setIsVisible as setIsWelcomeMessageVisible,
} from 'src/redux/slices/welcomeMessage';

const HomePageWelcomeMessage = () => {
  const { t } = useTranslation('home');
  const { isVisible } = useSelector(selectWelcomeMessage, shallowEqual);
  const dispatch = useDispatch();

  if (!isVisible) return null;
  return (
    <div className={styles.container}>
      {/* <p className={styles.version}>
        <span>QDC BETA v.1.10</span>
        <InfoIcon />
      </p> */}
      <h3 className={styles.title}>{t('welcome.title')}</h3>
      <p className={styles.description}>{t('welcome.desc')}</p>
      <p className={styles.link}>
        <Link variant={LinkVariant.Blend} href="https://feedback.quran.com/">
          {t('welcome.feedback-cta')}
        </Link>
      </p>
      <p className={styles.link}>
        <Link variant={LinkVariant.Blend} href="https://discord.gg/FxRWSBfWxn">
          {t('welcome.join-cta')}
        </Link>
      </p>
      <div className={styles.closeIcon}>
        <Button
          size={ButtonSize.Small}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
          onClick={() => dispatch(setIsWelcomeMessageVisible(false))}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
};

export default HomePageWelcomeMessage;
