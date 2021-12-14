import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import QSimpleIcon from '../../../../public/icons/Q_simple.svg';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import { toLocalizedDate } from 'src/utils/locale';

const Footer = () => {
  const { t, lang } = useTranslation('common');
  const localizedCurrentYear = useMemo(
    () => toLocalizedDate(new Date(), lang, { year: 'numeric', calendar: 'gregory' }),
    [lang],
  );
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
          © {localizedCurrentYear}{' '}
          <Link href="https://quran.com" variant={LinkVariant.Highlight}>
            {
              // we don't want to localize Quran.com text
              // eslint-disable-next-line i18next/no-literal-string
              'Quran.com'
            }
          </Link>
          . {t('home:footer.rights')}
        </div>
      </div>
    </div>
  );
};

export default Footer;
