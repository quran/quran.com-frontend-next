import { useRouter } from 'next/router';

import BottomSection from './BottomSection';
import styles from './Footer.module.scss';
import Links from './Links';
import TitleAndDescription from './TitleAndDescription';

const Footer = () => {
  const router = useRouter();

  // Don't render the footer on login pages
  if (router.pathname.includes('/login')) {
    return null;
  }

  return (
    <footer>
      <div className={styles.flowItem}>
        <div className={styles.container}>
          <TitleAndDescription />
          <Links />
        </div>
        <BottomSection />
      </div>
      <div className={styles.emptySpacePlaceholder} />
    </footer>
  );
};

export default Footer;
