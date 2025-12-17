/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { GetStaticProps, NextPage } from 'next';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './developers.module.scss';

import ApiDocsSection from '@/components/ApiDocsSection/ApiDocsSection';
import AppPortalSection from '@/components/AppPortalSection';
import CommunitySection from '@/components/Navbar/NavigationDrawer/CommunitySection';
import LabsSection from '@/components/Navbar/NavigationDrawer/LabsSection';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import commonStyles from '@/pages/contentPage.module.scss';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

const path = '/developers';
const DevelopersPage: NextPage = () => {
  const { t, lang } = useTranslation('developers');
  const projects = [
    { key: 'q-next', href: 'https://github.com/quran/quran.com-frontend-next' },
    { key: 'q-api', href: 'https://github.com/quran/quran.com-api' },
    { key: 'q-android', href: 'https://github.com/quran/quran_android' },
    { key: 'q-ios', href: 'https://github.com/quran/quran-ios' },
    { key: 'q-audio', href: 'https://github.com/quran/audio.quran.com' },
  ] as const;
  return (
    <>
      <NextSeoWrapper
        title={t('common:developers')}
        url={getCanonicalUrl(lang, path)}
        languageAlternates={getLanguageAlternates(path)}
      />
      <PageContainer>
        <div className={commonStyles.contentPage}>
          <div className={styles.pageHero}>
            <p className={styles.kicker}>{t('common:developers')}</p>
            <h1 className={styles.heroTitle}>{t('hero.title')}</h1>
            <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>
          </div>

          <div className={styles.sectionGrid}>
            <section className={styles.featureCard}>
              <div className={styles.cardHeading}>
                <span className={styles.pill}>{t('app-portal.heading')}</span>
                <p className={styles.cardLead}>{t('app-portal.description')}</p>
              </div>
              <AppPortalSection variant="inline" />
            </section>

            <section className={styles.featureCard}>
              <div className={styles.cardHeading}>
                <span className={styles.pill}>{t('labs')}</span>
                <p className={styles.cardLead}>{t('labs-description')}</p>
              </div>
              <LabsSection variant="inline" />
            </section>

            <section className={styles.featureCard}>
              <div className={styles.cardHeading}>
                <span className={styles.pill}>{t('api-docs.title')}</span>
                <p className={styles.cardLead}>{t('api-docs.sub-header')}</p>
              </div>
              <ApiDocsSection variant="inline" />
            </section>
          </div>

          <section className={styles.supportSection}>
            <h2 className={styles.sectionTitle}>{t('header')}</h2>
            <div className={styles.featureCard}>
              <CommunitySection variant="inline" />
            </div>
          </section>

          <section className={styles.projectsSection}>
            <h2 className={styles.sectionTitle}>{t('common:our-projects')}</h2>
            <p className={styles.sectionSubtitle}>{t('projects.lead')}</p>
            <div className={styles.projectGrid}>
              {projects.map((project) => {
                const { key, href } = project;
                const nameKey = `projects.items.${key}.name` as const;
                const descriptionKey = `projects.items.${key}.description` as const;
                const stackKey = `projects.items.${key}.stack` as const;
                return (
                  <div key={key} className={styles.projectCard}>
                    <div className={styles.projectHeader}>
                      <a
                        href={href}
                        className={styles.projectName}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t(nameKey)}
                      </a>
                    </div>
                    <p className={styles.projectDescription}>{t(descriptionKey)}</p>
                    <p className={styles.projectStack}>{t(stackKey)}</p>
                  </div>
                );
              })}
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};
export default DevelopersPage;
