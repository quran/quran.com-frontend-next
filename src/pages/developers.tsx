/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
import { GetStaticProps, NextPage } from 'next';
import Trans from 'next-translate/Trans';
import useTranslation from 'next-translate/useTranslation';

import styles from './contentPage.module.scss';

import CommunitySection from '@/components/Navbar/NavigationDrawer/CommunitySection';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import ChaptersData from '@/types/ChaptersData';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl } from '@/utils/navigation';

type DevelopersPageProps = {
  chaptersData: ChaptersData;
};

const PATH = '/developers';
const GITHUB_PROJECTS = [
  {
    key: 0,
    i18nKey: 'developers:projects.q-next',
    links: [{ key: 0, href: 'https://github.com/quran/quran.com-frontend-next' }],
  },
  {
    key: 1,
    i18nKey: 'developers:projects.q-api',
    links: [{ key: 0, href: 'https://github.com/quran/quran.com-api' }],
  },
  {
    key: 2,
    i18nKey: 'developers:projects.q-android',
    links: [{ key: 0, href: 'https://github.com/quran/quran_android' }],
  },
  {
    key: 3,
    i18nKey: 'developers:projects.q-ios',
    links: [{ key: 0, href: 'https://github.com/quran/quran-ios' }],
  },
  {
    key: 4,
    i18nKey: 'developers:projects.q-audio',
    links: [
      { key: 0, href: 'https://github.com/quran/audio.quran.com' },
      { key: 1, href: 'https://github.com/quran/quranicaudio-app' },
    ],
  },
];
const DevelopersPage: NextPage<DevelopersPageProps> = (): JSX.Element => {
  const { t, lang } = useTranslation('developers');
  return (
    <>
      <NextSeoWrapper
        title={t('common:developers')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
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
            {GITHUB_PROJECTS.map((project) => (
              <p key={project.key}>
                <Trans
                  i18nKey={project.i18nKey}
                  components={project.links.map((link) => (
                    <a key={link.key} href={link.href} target="_blank" rel="noreferrer" />
                  ))}
                />
              </p>
            ))}
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const allChaptersData = await getAllChaptersData(locale);

  return {
    props: {
      chaptersData: allChaptersData,
    },
  };
};

export default DevelopersPage;
