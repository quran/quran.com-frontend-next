import { FC } from 'react';

import classNames from 'classnames';

import styles from './login.module.scss';

import QuranLogo from '@/icons/logo_main.svg';
import QRColoredLogo from '@/icons/qr-colored.svg';
import QRLogo from '@/icons/qr-logo.svg';

const AuthHeader: FC = () => {
  return (
    <>
      <div className={styles.authLogos}>
        <QuranLogo height={20} />
        <div className={classNames(styles.reflectLogos, styles.scaleDown)}>
          <QRColoredLogo className={styles.reflectLogo} />
          <QRLogo className={styles.reflectLogo} />
        </div>
      </div>
      <hr className={styles.divider} />
    </>
  );
};

export default AuthHeader;
