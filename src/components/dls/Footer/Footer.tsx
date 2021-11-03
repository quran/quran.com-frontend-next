import useTranslation from 'next-translate/useTranslation';

import QSimpleIcon from '../../../../public/icons/Q_simple.svg';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';

const Footer = () => {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();
  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <QSimpleIcon />
      </div>
      <div>
        <div className={styles.title}>{t('home:footer.title')}</div>
        <div className={styles.itemsContainer}>
          <div>
            <Link variant={LinkVariant.Primary} href="/privacy">
              {t('privacy')}
            </Link>
          </div>
          <div>
            <Link variant={LinkVariant.Primary} href="/about-us">
              {t('about')}
            </Link>
          </div>
          <div>
            <Link variant={LinkVariant.Primary} href="/developers">
              {t('developers')}
            </Link>
          </div>
          {/* <div>
            <Link variant={LinkVariant.Primary} href="/terms">
              Terms
            </Link>
          </div> */}
          <div>
            <Link variant={LinkVariant.Primary} href="https://feedback.quran.com">
              {t('feedback')}
            </Link>
          </div>
          <div>
            <Link variant={LinkVariant.Primary} href="/support">
              {t('help')}
            </Link>
          </div>
          <div>
            <Link variant={LinkVariant.Primary} href="/sitemap.xml">
              {t('sitemap')}
            </Link>
          </div>
        </div>
        <div className={styles.copyright}>
          © {currentYear}{' '}
          <Link href="https://quran.com" variant={LinkVariant.Highlight}>
            {t('quran-com')}
          </Link>
          . {t('home:footer.rights')}
        </div>
      </div>
    </div>
  );
};

export default Footer;
