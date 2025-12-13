/* eslint-disable i18next/no-literal-string */
import React from 'react';

import styles from './MTFBanner.module.scss';

const MuslimTechFestBanner: React.FC = () => {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.kicker}>Meet our team at</div>
        <div className={styles.heading}>
          <span className={styles.white}>Muslim Tech Fest</span>
          <span className={styles.cross}>×</span>
          <span className={styles.red}>Al Sharq Youth</span>
        </div>
        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.icon}>📅</span>
            <span>December 12-13, 2025</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.icon}>📍</span>
            <span>Pullman Istanbul Hotel</span>
          </div>
        </div>
        <a
          href="https://www.muslimtechfest.com/alsharq"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.button}
        >
          Learn More
        </a>
      </div>
    </div>
  );
};

export default MuslimTechFestBanner;
