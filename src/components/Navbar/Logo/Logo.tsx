import Link from 'next/link';

import QuranTextLogo from '../../../../public/icons/quran-text-logo.svg';

import styles from './Logo.module.scss';

const Logo = () => {
  return (
    <Link href="/">
      <a className={styles.logoWrapper}>
        <QuranTextLogo />
      </a>
    </Link>
  );
};

export default Logo;
