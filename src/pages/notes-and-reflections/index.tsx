/* eslint-disable max-lines */

import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import withAuth from '@/components/Auth/withAuth';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import NotesTabs from '@/components/Notes/NotesPage/Tabs';
import layoutStyles from '@/pages/index.module.scss';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getNotesNavigationUrl } from '@/utils/navigation';

const NotesAndReflectionsPage = () => {
  const { t, lang } = useTranslation();
  const navigationUrl = getNotesNavigationUrl();

  return (
    <>
      <NextSeoWrapper
        title={t('common:notes.title')}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        nofollow
        noindex
      />
      <div className={layoutStyles.pageContainer}>
        <div className={layoutStyles.flow}>
          <div className={layoutStyles.flowItem}>
            <NotesTabs />
          </div>
        </div>
      </div>
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

export default withAuth(NotesAndReflectionsPage);
