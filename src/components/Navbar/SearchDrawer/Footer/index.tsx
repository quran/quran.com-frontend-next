import React from 'react';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import Separator from 'src/components/dls/Separator/Separator';

const Footer: React.FC = () => {
  return (
    <>
      <div className={styles.separatorContainer}>
        <Separator />
      </div>
      <div className={styles.container}>
        <div className={styles.betaContainer}>
          <div>
            <p>QURANIC VOICE SEARCH</p>
            <div>
              <span>POWERED BY: </span>
              <span className={styles.bold}>TARTEEL.AI</span>
            </div>
          </div>
          <div className={styles.beta}>BETA</div>
        </div>
        <Link href="https://download.tarteel.ai" newTab variant={LinkVariant.Highlight}>
          LEARN HOW TO USE VOICE SEARCH
        </Link>
      </div>
    </>
  );
};

export default Footer;
