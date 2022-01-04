import Link from 'next/link';

import QuranTextLogo from '../../../../public/icons/quran-text-logo.svg';

import styles from './NavbarLogoWrapper.module.scss';

const NavbarLogoWrapper = () => {
  return (
    <Link href="/">
      <a className={styles.logoWrapper}>
        <QuranTextLogo />
      </a>
    </Link>
  );
};

export default NavbarLogoWrapper;
