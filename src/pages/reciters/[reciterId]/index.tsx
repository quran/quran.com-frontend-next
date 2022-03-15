import { useState, useMemo } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
import { GetStaticPaths, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import SearchIcon from '../../../../public/icons/search.svg';
import layoutStyle from '../../index.module.scss';
import pageStyle from '../reciterPage.module.scss';

import { getReciterData } from 'src/api';
import Footer from 'src/components/dls/Footer/Footer';
import Input from 'src/components/dls/Forms/Input';
import NextSeoWrapper from 'src/components/NextSeoWrapper';
import ChaptersList from 'src/components/Reciter/ChaptersList';
import ReciterInfo from 'src/components/Reciter/ReciterInfo';
import { getAllChaptersData } from 'src/utils/chapter';
import { logEmptySearchResults } from 'src/utils/eventLogger';
import { getLanguageAlternates, toLocalizedNumber } from 'src/utils/locale';
import { getCanonicalUrl, getReciterNavigationUrl } from 'src/utils/navigation';
import Chapter from 'types/Chapter';
import Reciter from 'types/Reciter';

const filterChapters = (chapters, searchQuery: string) => {
  const fuse = new Fuse(chapters, {
    keys: ['transliteratedName'],
    threshold: 0.3,
  });

  const filteredReciter = fuse.search(searchQuery);
  const resultItems = filteredReciter.map(({ item }) => item);
  if (!filteredReciter.length) {
    logEmptySearchResults(searchQuery, 'reciter_page_chapter_list');
  }
  return resultItems as Chapter[];
};

type ReciterPageProps = { selectedReciter: Reciter };
const ReciterPage = ({ selectedReciter }: ReciterPageProps) => {
  const { t, lang } = useTranslation();
  const allChapterData = getAllChaptersData(lang);

  const [searchQuery, setSearchQuery] = useState('');

  // `allChaptersData` type is Record<string, Chapter>, but we need Chapter[] format with `id` inside the object
  // because `Fuse` library expects Array of objects, not Record<string, Chapter>
  const allChaptersWithId = useMemo(
    () =>
      Object.entries(allChapterData).map(([chapterId, chapter]) => {
        return {
          id: chapterId.toString(),
          localizedId: toLocalizedNumber(Number(chapterId), lang),
          ...chapter,
        };
      }),
    [allChapterData, lang],
  );

  const filteredChapters = useMemo(
    () => (searchQuery ? filterChapters(allChaptersWithId, searchQuery) : allChaptersWithId),
    [searchQuery, allChaptersWithId],
  );

  const navigationUrl = getReciterNavigationUrl(selectedReciter.id.toString());

  return (
    <div className={classNames(layoutStyle.pageContainer)}>
      <NextSeoWrapper
        title={selectedReciter?.translatedName?.name}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('reciter:reciter-desc', {
          reciterName: selectedReciter?.translatedName?.name,
        })}
      />

      <div className={pageStyle.reciterInfoContainer}>
        <div className={classNames(layoutStyle.flowItem, pageStyle.headerContainer)}>
          <ReciterInfo selectedReciter={selectedReciter} />
        </div>
      </div>

      <div className={classNames(layoutStyle.flowItem, pageStyle.searchContainer)}>
        <Input
          prefix={<SearchIcon />}
          id="translations-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('reciter:search-chapter')}
          fixedWidth={false}
        />
      </div>

      <div className={classNames(layoutStyle.flowItem, pageStyle.chaptersListContainer)}>
        <ChaptersList filteredChapters={filteredChapters} selectedReciter={selectedReciter} />
      </div>

      <div className={classNames(layoutStyle.flowItem, pageStyle.footerContainer)}>
        <Footer />
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  try {
    const reciterId = params.reciterId as string;

    const reciterData = await getReciterData(reciterId, locale);

    return {
      props: {
        selectedReciter: reciterData.reciter,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [], // no pre-rendered chapters at build time.
  fallback: 'blocking', // will server-render pages on-demand if the path doesn't exist.
});

export default ReciterPage;
