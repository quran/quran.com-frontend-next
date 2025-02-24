import { FC } from 'react';

import styles from './login.module.scss';

import QuranLogo from '@/icons/logo_main.svg';
import QRColoredLogo from '@/icons/qr-colored.svg';
import QuranReflectLogo from '@/icons/qr-logo.svg';

const AuthHeader: FC = () => {
  return (
    <>
      <div className={styles.authLogos}>
        <QuranLogo />
        <div className={styles.qrLogos}>
          <QRColoredLogo />
          <QuranReflectLogo />
        </div>
      </div>
      <hr className={styles.serviceDivider} />
    </>
  );
};

export default AuthHeader;
