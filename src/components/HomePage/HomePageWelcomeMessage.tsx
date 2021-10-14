import React from 'react';

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
  const { isVisible } = useSelector(selectWelcomeMessage, shallowEqual);
  console.log(isVisible);
  const dispatch = useDispatch();

  if (!isVisible) return null;
  return (
    <div className={styles.container}>
      {/* <p className={styles.version}>
        <span>QDC BETA v.1.10</span>
        <InfoIcon />
      </p> */}
      <h3 className={styles.title}>Welcome to the Pre-Release Beta of the new Quran.com!</h3>
      <p className={styles.description}>
        We are actively adding new features and pushing changes. If you run into any issues please
        do provide feedback.
      </p>
      <p className={styles.link}>
        <Link variant={LinkVariant.Blend} href="https://feedback.quran.com/">
          Provide Feedback
        </Link>
      </p>
      <p className={styles.link}>
        <Link variant={LinkVariant.Blend} href="https://discord.gg/H62eG8ss">
          Join Discord Community
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
