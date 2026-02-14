import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import BottomSection from './BottomSection';
import styles from './Footer.module.scss';
import Links from './Links';
import TitleAndDescription from './TitleAndDescription';

const Footer = () => {
  const router = useRouter();
  const { t: tAppPortal } = useTranslation('app-portal');

  // Don't render the footer on login pages
  if (router.pathname.includes('/login')) {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.flowItem}>
        <div className={styles.container}>
          <TitleAndDescription />
          <Links />
        </div>
        {router.pathname === '/apps' && (
          <p className={styles.description}>{tAppPortal('footer.disclaimer')}</p>
        )}
        <BottomSection />
      </div>
      <div className={styles.emptySpacePlaceholder} />
    </footer>
  );
};

export default Footer;
