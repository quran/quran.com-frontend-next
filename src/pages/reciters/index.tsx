import { useMemo, useState } from 'react';

import classNames from 'classnames';
import { GetStaticProps } from 'next';
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
import { getCanonicalUrl } from '@/utils/navigation';
import { REVALIDATION_PERIOD_ON_ERROR_SECONDS } from '@/utils/staticPageGeneration';

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
      <div className={classNames(layoutStyle.flow, pageStyle.flow)}>
        <QuranReciterListHero searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
        <div className={classNames(layoutStyle.flowItem, pageStyle.recitersListContainer)}>
          <RecitersList reciters={filteredReciters} />
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  try {
    const { reciters } = await getAvailableReciters(locale, [
      'profile_picture',
      'cover_image',
      'bio',
    ]);
    const chaptersData = await getAllChaptersData(locale);

    return {
      props: {
        chaptersData,
        reciters: reciters || [],
      },
    };
  } catch (e) {
    return {
      notFound: true,
      revalidate: REVALIDATION_PERIOD_ON_ERROR_SECONDS,
    };
  }
};

export default RecitersListPage;
