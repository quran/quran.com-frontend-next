import { useMemo, useState } from 'react';

import classNames from 'classnames';
import { GetStaticProps } from 'next';

import Error from '../_error';
import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import { getAvailableReciters } from 'src/api';
import Footer from 'src/components/dls/Footer/Footer';
import { filterReciters } from 'src/components/Navbar/SettingsDrawer/ReciterSelectionBody';
import QuranReciterListHero from 'src/components/Reciter/QuranReciterListHero';
import RecitersList from 'src/components/Reciter/RecitersList';

const RecitersListPage = ({ reciters, hasError }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReciters = useMemo(
    () => (searchQuery ? filterReciters(reciters, searchQuery) : reciters),
    [searchQuery, reciters],
  );

  if (hasError) return <Error statusCode={500} />;
  return (
    <div className={layoutStyle.flow}>
      <QuranReciterListHero searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />
      <div className={classNames(layoutStyle.flowItem, pageStyle.recitersListContainer)}>
        <RecitersList reciters={filteredReciters} />
      </div>

      <div className={classNames(layoutStyle.flowItem)}>
        <Footer />
      </div>
    </div>
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
