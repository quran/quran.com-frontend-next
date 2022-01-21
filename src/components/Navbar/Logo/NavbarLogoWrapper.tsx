import QuranTextLogo from '../../../../public/icons/quran-text-logo.svg';

import styles from './NavbarLogoWrapper.module.scss';

import Link from 'src/components/dls/Link/Link';

const NavbarLogoWrapper = () => {
  return (
    <Link href="/" prefetch={false}>
      <a className={styles.logoWrapper}>
        <QuranTextLogo />
      </a>
    </Link>
  );
};

export default NavbarLogoWrapper;
