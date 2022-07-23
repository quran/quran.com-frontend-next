import useTranslation from 'next-translate/useTranslation';

import { FaQuran } from 'react-icons/fa';

import styles from './NavbarLogoWrapper.module.scss';

import Link from 'src/components/dls/Link/Link';

const NavbarLogoWrapper = () => {
  const { t } = useTranslation('common');
  return (
    <Link href="/" className={styles.logoWrapper} title={t('quran-com')}>
      <FaQuran />
    </Link>
  );
};

export default NavbarLogoWrapper;
