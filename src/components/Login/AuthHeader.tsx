import { FC } from 'react';

import Image from 'next/image';

import styles from './login.module.scss';

const AuthHeader: FC = () => {
  return (
    <>
      <div className={styles.authLogos}>
        <Image src="/icons/logo_main.svg" alt="Quran Logo" width={96} height={20} />
        <Image src="/icons/qr-registration-logo.svg" alt="QR Logo" width={120} height={22} />
      </div>
      <hr className={styles.divider} />
    </>
  );
};

export default AuthHeader;
