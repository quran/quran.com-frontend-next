import { useMemo, useState } from 'react';

import classNames from 'classnames';
import { GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import Error from '../_error';
import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import { getAvailableReciters } from 'src/api';
import Footer from 'src/components/dls/Footer/Footer';
import { filterReciters } from 'src/components/Navbar/SettingsDrawer/ReciterSelectionBody';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import QuranReciterListHero from 'src/components/Reciter/QuranReciterListHero';
import RecitersList from 'src/components/Reciter/RecitersList';
import { getLanguageAlternates } from 'src/utils/locale';
import { getCanonicalUrl } from 'src/utils/navigation';

const NAVIGATION_URL = '/reciters';

const RecitersListPage = ({ reciters, hasError }) => {
  const { t, lang } = useTranslation('reciter');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReciters = useMemo(
    () => (searchQuery ? filterReciters(reciters, searchQuery) : reciters),
    [searchQuery, reciters],
  );

  if (hasError) return <Error statusCode={500} />;

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

        <div className={classNames(layoutStyle.flowItem)}>
          <Footer />
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

    return {
      props: {
        reciters: reciters || [],
      },
    };
  } catch (e) {
    return {
      props: {
        hasError: true,
      },
    };
  }
};

export default RecitersListPage;
