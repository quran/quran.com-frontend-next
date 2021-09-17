import React from 'react';

import styles from './HomePageWelcomeMessage.module.scss';

import Link from 'src/components/dls/Link/Link';

const HomePageWelcomeMessage = () => (
  <div className={styles.container}>
    <p>
      Welcome to the pre-release version of the new Quran.com! We are actively adding new features
      and pushing changes. Please give us your{' '}
      <Link href="https://feedback.quran.com" newTab>
        feedback here
      </Link>
      , and join the #beta channel on our{' '}
      <Link href="https://discord.gg/H62eG8ss" newTab>
        discord server
      </Link>{' '}
      for the latest updates.
    </p>
    <p>May Allah swt accept your deeds. </p>
    <p> - The QDC Team</p>
  </div>
);

export default HomePageWelcomeMessage;
