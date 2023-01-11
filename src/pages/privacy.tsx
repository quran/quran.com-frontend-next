/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { NextPage } from 'next';
import { useTranslation, Trans } from 'next-i18next';
import { useRouter } from 'next/router';

import styles from './contentPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

const PATH = '/privacy';
const PrivacyPage: NextPage = (): JSX.Element => {
  const { t } = useTranslation('privacy');
  const { locale } = useRouter();

  return (
    <>
      <NextSeoWrapper
        title={t('header')}
        url={getCanonicalUrl(locale, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
      />
      <PageContainer>
        <div className={styles.contentPage}>
          <h1>{t('header')}</h1>
          <p>
            <Trans
              i18nKey="privacy:main-privacy-desc"
              components={[<a key={0} href="salah.com" target="_blank" />]}
            />
          </p>
          <p>
            <Trans
              i18nKey="privacy:ga"
              components={[
                <a
                  key={0}
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="nofollow noreferrer noopener"
                />,
              ]}
            />
          </p>
          <p>
            <Trans i18nKey="privacy:privacy-footer" />
          </p>
        </div>
      </PageContainer>
    </>
  );
};

export default PrivacyPage;
