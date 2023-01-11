/* eslint-disable i18next/no-literal-string */
import { useMemo } from 'react';

import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import { PopoverMenuExpandDirection } from '../PopoverMenu/PopoverMenu';

import styles from './Footer.module.scss';
import FooterThemeSwitcher from './FooterThemeSwitcher';

import LanguageSelector from '@/components/Navbar/LanguageSelector';
import Link, { LinkVariant } from '@/dls/Link/Link';
import { toLocalizedDate } from '@/utils/locale';

const BottomSection = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const localizedCurrentYear = useMemo(
    () =>
      toLocalizedDate(new Date(), locale, {
        year: 'numeric',
        calendar: 'gregory',
      }),
    [locale],
  );

  return (
    <div className={styles.bottomSectionContainer}>
      <div>
        <div className={styles.bottomLinks}>
          <Link href="/sitemap.xml" shouldPrefetch={false} isNewTab>
            {t('sitemap')}
          </Link>
          <Link href="/privacy" shouldPrefetch={false}>
            {t('privacy')}
          </Link>
        </div>
        <div className={styles.copyright}>
          © {localizedCurrentYear}{' '}
          <Link href="https://quran.com" variant={LinkVariant.Highlight} shouldPrefetch={false}>
            {
              // we don't want to localize Quran.com text
              // eslint-disable-next-line i18next/no-literal-string
              'Quran.com'
            }
          </Link>
          . {t('footer.rights')}
        </div>
      </div>
      <div className={styles.actionsSections}>
        <div className={styles.actionContainer}>
          <FooterThemeSwitcher />
        </div>
        <div className={styles.actionContainer}>
          <LanguageSelector
            shouldShowSelectedLang
            expandDirection={PopoverMenuExpandDirection.TOP}
          />
        </div>
      </div>
    </div>
  );
};

export default BottomSection;
