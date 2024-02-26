/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { NextPage } from 'next';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

const PATH = '/privacy';
const PrivacyPage: NextPage = (): JSX.Element => {
  const { t, lang } = useTranslation('privacy');

  return (
    <>
      <NextSeoWrapper
        title={t('privacy-header')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
      />
      <PageContainer>
        <div className={styles.contentPage}>
          <h1>{t('privacy-header')}</h1>
          <p>{t('main-privacy-desc')}</p>
          <h2>{t('info-collection.title')}</h2>
          <p>
            <Trans
              components={{
                br: <br />,
                underline: <span className={styles.underline} />,
              }}
              i18nKey="privacy:info-collection.desc"
            />
          </p>
          <h2>{t('personal-info-use.title')}</h2>
          <p>
            <Trans
              components={{
                br: <br />,
                li: <li />,
                underline: <span className={styles.underline} />,
              }}
              i18nKey="privacy:personal-info-use.desc"
            />
          </p>
          <h2>{t('log-data.title')}</h2>
          <p>{t('log-data.desc')}</p>
          <h2>{t('communication.title')}</h2>
          <p>{t('communication.desc')}</p>
          <h2>{t('data-protection.title')}</h2>
          <p>
            <Trans
              components={{
                br: <br />,
                boldSpan: <span key={2} className={styles.bold} />,
              }}
              i18nKey="privacy:data-protection.desc"
            />
          </p>
          <h2>{t('data-security.title')}</h2>
          <p>{t('data-security.desc')}</p>
          <h2>{t('data-sharing.title')}</h2>
          <p>{t('data-sharing.desc')}</p>
          <h2>{t('data-analysis.title')}</h2>
          <p>{t('data-analysis.desc')}</p>
          <h2>{t('data-deletion.title')}</h2>
          <p>{t('data-deletion.desc')}</p>
          <h2>{t('cookies.title')}</h2>
          <p>
            <Trans
              components={{
                br: <br />,
                li: <li />,
                subLi: <li className={styles.subListItem} />,
                underline: <span className={styles.underline} />,
              }}
              i18nKey="privacy:cookies.desc"
            />
          </p>
          <h2>{t('contact-us.title')}</h2>
          <p>
            <Trans
              components={{
                br: <br />,
                li: <li />,
                underline: <span className={styles.underline} />,
                0: (
                  <a key={0} href="mailto:info@quran.foundation" target="_blank" rel="noreferrer" />
                ),
              }}
              i18nKey="privacy:contact-us.desc"
            />
          </p>
        </div>
      </PageContainer>
    </>
  );
};

export default PrivacyPage;
