/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { GetServerSideProps, NextPage } from 'next';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import ApiDocsSection from '@/components/ApiDocsSection/ApiDocsSection';
import AppPortalSection from '@/components/AppPortalSection';
import CareersSection from '@/components/CareersSection/CareersSection';
import CommunitySection from '@/components/Navbar/NavigationDrawer/CommunitySection';
import LabsSection from '@/components/Navbar/NavigationDrawer/LabsSection';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';

const path = '/developers';
const DevelopersPage: NextPage = () => {
  const { t, lang } = useTranslation('developers');
  return (
    <>
      <NextSeoWrapper
        title={t('common:developers')}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <PageContainer>
        <div className={styles.contentPage}>
          <h1>{t('careers.career')}</h1>
          <CareersSection />
          <h1>{t('header')}</h1>
          <CommunitySection />
          <h1>{t('labs')}</h1>
          <LabsSection />
          <h1>{t('app-portal.heading')}</h1>
          <AppPortalSection />
          <h1>{t('api-docs.title')}</h1>
          <ApiDocsSection />
          <p>{t('main-desc')}</p>
          <p>
            <Trans
              i18nKey="developers:projects.all"
              components={[
                <a key={0} href="https://github.com/quran" target="_blank" rel="noreferrer" />,
              ]}
            />
          </p>
          <div>
            <p>
              <Trans
                i18nKey="developers:projects.q-next"
                components={[
                  <a
                    key={0}
                    href="https://github.com/quran/quran.com-frontend-next"
                    target="_blank"
                    rel="noreferrer"
                  />,
                ]}
              />
            </p>
            <p>
              <Trans
                i18nKey="developers:projects.q-api"
                components={[
                  <a
                    key={0}
                    href="https://github.com/quran/quran.com-api"
                    target="_blank"
                    rel="noreferrer"
                  />,
                ]}
              />
            </p>
            <p>
              <Trans
                i18nKey="developers:projects.q-android"
                components={[
                  <a
                    key={0}
                    href="https://github.com/quran/quran_android"
                    target="_blank"
                    rel="noreferrer"
                  />,
                ]}
              />
            </p>
            <p>
              <Trans
                i18nKey="developers:projects.q-ios"
                components={[
                  <a
                    key={0}
                    href="https://github.com/quran/quran-ios"
                    target="_blank"
                    rel="noreferrer"
                  />,
                ]}
              />
            </p>
            <p>
              <Trans
                i18nKey="developers:projects.q-audio"
                components={[
                  <a
                    key={0}
                    href="https://github.com/quran/audio.quran.com"
                    target="_blank"
                    rel="noreferrer"
                  />,
                  <a
                    key={1}
                    href="https://github.com/quran/quranicaudio-app"
                    target="_blank"
                    rel="noreferrer"
                  />,
                ]}
              />
            </p>
          </div>
          <p>
            <Trans
              i18nKey="developers:issues-guide"
              components={[
                <a
                  key={0}
                  href="https://github.com/quran/quran.com-frontend-next/pulls"
                  target="_blank"
                  rel="noreferrer"
                />,
                <a
                  key={1}
                  href="https://github.com/quran/quran.com-frontend-next/pulls"
                  target="_blank"
                  rel="noreferrer"
                />,
              ]}
            />
          </p>
          <p>{t('issues-cta')}</p>
          <p>{t('thanks')}</p>
          <p>{t('footer')}</p>
        </div>
      </PageContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/developers');

export default DevelopersPage;
