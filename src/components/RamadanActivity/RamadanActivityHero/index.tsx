/* eslint-disable i18next/no-literal-string */
import React from 'react';

import styles from './Hero.module.scss';

const RamadanActivityHero = () => {
  return (
    <div className={styles.container} dir="ltr">
      <div className={styles.rowContainer}>
        <div className={styles.row}>
          <p className={styles.header}>Ramadan Activities</p>
          <div className={styles.desc}>
            As we welcome the month of Ramadan, were excited to present programs and features to
            <b> help you on your journey with the Quran</b>. These resources are aimed at enriching
            and deepening your connection with the words of Allah in Ramadan and beyond.
            <br />
            <br />
            Browse the list and select the programs and features that align best with your goals and
            needs:
          </div>
        </div>
      </div>
    </div>
  );
};

export default RamadanActivityHero;
