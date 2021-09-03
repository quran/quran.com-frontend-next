import React from 'react';
import styles from './HomePageWelcomeMessage.module.scss';

const HomePageWelcomeMessage = () => (
  <div className={styles.container}>
    <p>
      Welcome to the pre-release version of the new Quran.com! We are actively adding new features
      and pushing changes. Please give us your{' '}
      <a href="https://quran.upvoty.com" target="_blank" rel="noreferrer">
        feedback here
      </a>
      , and join the #beta channel on our{' '}
      <a href="https://discord.gg/H62eG8ss" target="blank">
        discord server
      </a>{' '}
      for the latest updates.
    </p>
    <p>May Allah swt accept your deeds. </p>
    <p> - The QDC Team</p>
  </div>
);

export default HomePageWelcomeMessage;
