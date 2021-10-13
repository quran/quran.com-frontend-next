import React, { useState } from 'react';

import CloseIcon from '../../../public/icons/close.svg';
import InfoIcon from '../../../public/icons/info.svg';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '../dls/Button/Button';

import styles from './HomePageWelcomeMessage.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';

const HomePageWelcomeMessage = () => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className={styles.container}>
      <p className={styles.version}>
        <span>QDC BETA v.1.10</span>
        <InfoIcon />
      </p>
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
          onClick={() => setVisible(false)}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
};

export default HomePageWelcomeMessage;
