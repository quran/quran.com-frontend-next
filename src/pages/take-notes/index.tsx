import React from 'react';

import classNames from 'classnames';
import { GetStaticProps, NextPage } from 'next';
import useTranslation from 'next-translate/useTranslation';

import Benefits from './components/Benefits';
import Conclusion from './components/Conclusion';
import HowToUse from './components/HowToUse';
import Introduction from './components/Introduction';
import TableOfContents from './components/TableOfContents';

import NextSeoWrapper from '@/components/NextSeoWrapper';
import PageContainer from '@/components/PageContainer';
import styles from '@/pages/contentPage.module.scss';
import pageStyles from '@/pages/ramadan/RamadanActivities.module.scss';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getTakeNotesNavigationUrl } from '@/utils/navigation';

const PATH = getTakeNotesNavigationUrl();

const TakeNotesPage: NextPage = (): JSX.Element => {
  const { t, lang } = useTranslation('take-notes');

  return (
    <>
      <NextSeoWrapper
        title={t('meta.title')}
        url={getCanonicalUrl(lang, PATH)}
        languageAlternates={getLanguageAlternates(PATH)}
        description={t('meta.description')}
      />
      <PageContainer>
        <div className={classNames(pageStyles.container, styles.contentPage)} dir="ltr">
          <div className={styles.subSection}>
            <h1>{t('heading')}</h1>
            <TableOfContents />
            <Introduction />
            <HowToUse />
            <Benefits />
            <Conclusion />
          </div>
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

export default TakeNotesPage;
