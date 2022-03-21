import styles from './NavbarLogoWrapper.module.scss';

import Link from 'src/components/dls/Link/Link';
import { QuranTextLogoIcon } from 'src/components/Icons';

const NavbarLogoWrapper = () => {
  return (
    <Link href="/">
      <a className={styles.logoWrapper}>
        <QuranTextLogoIcon />
      </a>
    </Link>
  );
};

export default NavbarLogoWrapper;
