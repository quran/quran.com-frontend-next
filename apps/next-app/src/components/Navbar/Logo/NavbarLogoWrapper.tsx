import useTranslation from 'next-translate/useTranslation';

import QuranTextLogo from '../../../../public/icons/quran-text-logo.svg';

import styles from './NavbarLogoWrapper.module.scss';

import Link from 'src/components/dls/Link/Link';

const NavbarLogoWrapper = () => {
  const { t } = useTranslation('common');
  return (
    <Link href="/" className={styles.logoWrapper} title={t('quran-com')}>
      <QuranTextLogo />
    </Link>
  );
};

export default NavbarLogoWrapper;
