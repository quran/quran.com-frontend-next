import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import Separator from 'src/components/dls/Separator/Separator';

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div>
      <Separator />
      <div className={styles.container}>
        <div className={styles.betaContainer}>
          <div>
            <p className={styles.uppercase}>{t('tarteel.desc')}</p>
            <div>
              <span className={styles.uppercase}>{`${t('powered-by')}: `}</span>
              <span className={classNames(styles.bold, styles.uppercase)}>{t('tarteel.name')}</span>
            </div>
          </div>
          <div className={classNames(styles.beta, styles.uppercase)}>{t('beta')}</div>
        </div>
        <Link href="https://download.tarteel.ai" newTab variant={LinkVariant.Highlight}>
          <p className={styles.uppercase}>{t('tarteel.learn')}</p>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
