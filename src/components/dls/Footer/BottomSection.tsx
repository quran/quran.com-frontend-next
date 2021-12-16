import { useMemo } from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './Footer.module.scss';

import Link, { LinkVariant } from 'src/components/dls/Link/Link';
import LanguageSelector from 'src/components/Navbar/LanguageSelector';
import { toLocalizedDate } from 'src/utils/locale';

const BottomSection = () => {
  const { t, lang } = useTranslation('common');
  const localizedCurrentYear = useMemo(
    () => toLocalizedDate(new Date(), lang, { year: 'numeric', calendar: 'gregory' }),
    [lang],
  );
  return (
    <div className={styles.bottomSectionContainer}>
      <div>
        <div className={styles.bottomLinks}>
          <Link href="/sitemap">{t('sitemap')}</Link>
          <Link href="/privacy">{t('privacy')}</Link>
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
      <div className={styles.languageSelectorContainer}>
        <LanguageSelector shouldShowSelectedLang />
      </div>
    </div>
  );
};

export default BottomSection;
