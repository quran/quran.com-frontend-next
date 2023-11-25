/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import CommunitySection from '@/components/Navbar/NavigationDrawer/CommunitySection';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

const path = '/developers';
const DevelopersPage = () => {
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
          <h1>{t('header')}</h1>
          <CommunitySection />
          <p>{t('main-desc')}</p>
          <p>
            <Trans
              i18nKey="developers:sub-main-desc"
              components={[
                <a key={0} href="https://tarteel.ai" target="_blank" rel="noreferrer" />,
              ]}
            />
          </p>
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
                i18nKey="developers:projects.q-api-docs"
                components={[
                  <a
                    key={0}
                    href="https://api-docs.quran.com/docs/category/quran.com-api"
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

export default DevelopersPage;
