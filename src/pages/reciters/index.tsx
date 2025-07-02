import { useMemo, useState } from 'react';

import classNames from 'classnames';
import { GetServerSideProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import { getAvailableReciters } from '@/api';
import { filterReciters } from '@/components/Navbar/SettingsDrawer/ReciterSelectionBody';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import QuranReciterListHero from '@/components/Reciter/QuranReciterListHero';
import RecitersList from '@/components/Reciter/RecitersList';
import { getAllChaptersData } from '@/utils/chapter';
import { getLanguageAlternates } from '@/utils/locale';
import { getCanonicalUrl, getRecitersNavigationUrl } from '@/utils/navigation';
import withSsrRedux from '@/utils/withSsrRedux';
import { AvailableRecitersResponse } from 'types/ApiResponses';

const NAVIGATION_URL = '/reciters';

const RecitersListPage = ({ reciters }) => {
  const { t, lang } = useTranslation('reciter');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReciters = useMemo(
    () => (searchQuery ? filterReciters(reciters, searchQuery) : reciters),
    [searchQuery, reciters],
  );

  return (
    <>
      <NextSeoWrapper
        title={t('quran-reciters')}
        description={t('reciters-desc')}
        canonical={getCanonicalUrl(lang, NAVIGATION_URL)}
        languageAlternates={getLanguageAlternates(NAVIGATION_URL)}
      />
      <div className={layoutStyle.flow}>
        <QuranReciterListHero searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
        <div className={classNames(layoutStyle.flowItem, pageStyle.recitersListContainer)}>
          <RecitersList reciters={filteredReciters} />
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = withSsrRedux('/reciters', async (context) => {
  const { locale } = context;
  let reciters = [];
  try {
    const availableRecitersResponse = await getAvailableReciters(locale, []);
    reciters = availableRecitersResponse.reciters;
  } catch (error) {
    // ignore the error and fall back to showing the page with default reciters
  }

  return {
    props: {
      reciters,
    },
  };
});

export default RecitersListPage;
