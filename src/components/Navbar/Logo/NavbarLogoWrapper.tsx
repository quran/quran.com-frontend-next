import useTranslation from 'next-translate/useTranslation';

import styles from './NavbarLogoWrapper.module.scss';

import Link from 'src/components/dls/Link/Link';
import QuranText from 'src/components/Icons/QuranText/QuranText';

const NavbarLogoWrapper = () => {
  const { t } = useTranslation('common');
  return (
    <Link href="/" className={styles.logoWrapper} title={t('quran-com')}>
      <QuranText />
    </Link>
  );
};

export default NavbarLogoWrapper;
