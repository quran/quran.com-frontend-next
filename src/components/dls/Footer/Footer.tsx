import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import BottomSection from './BottomSection';
import styles from './Footer.module.scss';
import Links from './Links';
import TitleAndDescription from './TitleAndDescription';

import { isQuranReaderRoutePathname } from '@/utils/routes';

const Footer = () => {
  const router = useRouter();
  const { t } = useTranslation('common');

  // Don't render the footer on login pages
  if (router.pathname.includes('/login')) {
    return null;
  }

  // Quran reader routes render their content on the elevated background surface
  // (see QuranReader.module.scss), so the footer must match that surface here too,
  // otherwise it creates a seam against the default background (#2336/#3326).
  const isQuranReaderRoute = isQuranReaderRoutePathname(router.pathname);

  return (
    <footer
      className={classNames(styles.footer, { [styles.elevatedBackground]: isQuranReaderRoute })}
    >
      <div className={styles.flowItem}>
        <div className={styles.container}>
          <TitleAndDescription />
          <Links />
        </div>
        {router.pathname === '/apps' && (
          <p className={styles.description}>{t('footer.apps-disclaimer')}</p>
        )}
        <BottomSection />
      </div>
      <div className={styles.emptySpacePlaceholder} />
    </footer>
  );
};

export default Footer;
