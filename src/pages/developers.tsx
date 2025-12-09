/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { GetServerSideProps, NextPage } from 'next';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import ApiDocsSection from '@/components/ApiDocsSection/ApiDocsSection';
import AppPortalSection from '@/components/AppPortalSection';
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
          <div className={styles.pageHero}>
            <p className={styles.kicker}>{t('common:developers')}</p>
            <h1 className={styles.heroTitle}>{t('api-docs.header')}</h1>
            <p className={styles.heroSubtitle}>{t('main-desc')}</p>
            <div className={styles.heroFooter}>{t('thanks')}</div>
          </div>

          <div className={styles.sectionGrid}>
            <section className={styles.featureCard}>
              <div className={styles.cardHeading}>
                <span className={styles.pill}>{t('labs')}</span>
                <p className={styles.cardLead}>{t('labs-description')}</p>
              </div>
              <LabsSection />
            </section>

            <section className={styles.featureCard}>
              <div className={styles.cardHeading}>
                <span className={styles.pill}>{t('app-portal.heading')}</span>
                <p className={styles.cardLead}>{t('app-portal.description')}</p>
              </div>
              <AppPortalSection />
            </section>

            <section className={styles.featureCard}>
              <div className={styles.cardHeading}>
                <span className={styles.pill}>{t('api-docs.title')}</span>
                <p className={styles.cardLead}>{t('api-docs.sub-header')}</p>
              </div>
              <ApiDocsSection />
            </section>
          </div>

          <section className={styles.supportSection}>
            <h2 className={styles.sectionTitle}>{t('header')}</h2>
            <div className={styles.featureCard}>
              <CommunitySection />
            </div>
          </section>

          <section className={styles.projectsSection}>
            <h2 className={styles.sectionTitle}>{t('common:our-projects')}</h2>
            <p className={styles.sectionSubtitle}>
              <Trans
                i18nKey="developers:projects.all"
                components={[
                  <a key={0} href="https://github.com/quran" target="_blank" rel="noreferrer" />,
                ]}
              />
            </p>
            <div className={styles.projectGrid}>
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
          </section>

          <section className={styles.callout}>
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
            <p className={styles.sectionSubtitle}>{t('issues-cta')}</p>
            <p className={styles.footerNote}>{t('footer')}</p>
          </section>
        </div>
      </PageContainer>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/developers');

export default DevelopersPage;
