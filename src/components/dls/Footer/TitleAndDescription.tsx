import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import QuranTextLogo from '../../../../public/icons/quran-text-logo.svg';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import { toLocalizedDate } from 'src/utils/locale';

const TitleAndDescription = () => {
  const { t, lang } = useTranslation('common');

  const localizedCurrentYear = useMemo(
    () => toLocalizedDate(new Date(), lang, { year: 'numeric', calendar: 'gregory' }),
    [lang],
  );
  return (
    <div className={styles.titleAndDescriptionContainer}>
      <div className={styles.headingContainer}>
        <div className={styles.iconContainer}>
          <QuranTextLogo />
        </div>
        <div className={styles.title}>{t('home:footer.title')}</div>
      </div>
      <p className={styles.description}>{t('footer-description')}</p>
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
  );
};

export default TitleAndDescription;
