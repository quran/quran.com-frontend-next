import QSimpleIcon from '../../../../public/icons/Q_simple.svg';

import styles from './Footer.module.scss';

import Link from 'src/components/dls/Link/Link';

const Footer = () => (
  <div className={styles.container}>
    <div className={styles.iconContainer}>
      <QSimpleIcon />
    </div>
    <div>
      <div className={styles.title}>Read, study, and learn The Noble Quran.</div>
      <div className={styles.itemsContainer}>
        <div>
          <Link href="/privacy">Privacy</Link>
        </div>
        <div>
          <Link href="/terms">Terms</Link>
        </div>
        <div>
          <Link href="/sitemap">Sitemap</Link>
        </div>
        <div>
          <Link href="https://feedback.quran.com">Provide Feedback</Link>
        </div>
      </div>
      <div className={styles.copyright}>© 2021 Quran.corp 501(c), All Rights Reserved.</div>
    </div>
  </div>
);

export default Footer;
