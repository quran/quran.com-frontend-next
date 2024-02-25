import { useState, useMemo } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
import { GetStaticPaths, GetStaticProps } from 'next';
import useTranslation from 'next-translate/useTranslation';

import layoutStyle from '../../index.module.scss';
import pageStyle from '../reciterPage.module.scss';

import { getReciterData } from '@/api';
import NextSeoWrapper from '@/components/NextSeoWrapper';
import ChaptersList from '@/components/Reciter/ChaptersList';
import ReciterInfo from '@/components/Reciter/ReciterInfo';
import Input from '@/dls/Forms/Input';
import SearchIcon from '@/icons/search.svg';
import SearchQuerySource from '@/types/SearchQuerySource';
import { getAllChaptersData } from '@/utils/chapter';
import { logEmptySearchResults } from '@/utils/eventLogger';
import { getLanguageAlternates, toLocalizedNumber } from '@/utils/locale';
import { getCanonicalUrl, getReciterNavigationUrl } from '@/utils/navigation';
import Chapter from 'types/Chapter';
import ChaptersData from 'types/ChaptersData';
import Reciter from 'types/Reciter';

const filterChapters = (chapters, searchQuery: string) => {
  const fuse = new Fuse(chapters, {
    keys: ['transliteratedName', 'id', 'localizedId'],
    threshold: 0.3,
  });

  const filteredReciter = fuse.search(searchQuery);
  const resultItems = filteredReciter.map(({ item }) => item);
  if (!filteredReciter.length) {
    logEmptySearchResults({
      query: searchQuery,
      source: SearchQuerySource.ReciterPageChapterList,
    });
  }
  return resultItems as Chapter[];
};

type ReciterPageProps = {
  selectedReciter: Reciter;
  chaptersData: ChaptersData;
};
const ReciterPage = ({ selectedReciter, chaptersData }: ReciterPageProps) => {
  const { t, lang } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');

  // `allChaptersData` type is Record<string, Chapter>, but we need Chapter[] format with `id` inside the object
  // because `Fuse` library expects Array of objects, not Record<string, Chapter>
  const allChaptersWithId = useMemo(
    () =>
      Object.entries(chaptersData).map(([chapterId, chapter]) => {
        return {
          id: chapterId.toString(),
          localizedId: toLocalizedNumber(Number(chapterId), lang),
          ...chapter,
        };
      }),
    [chaptersData, lang],
  );

  const filteredChapters = useMemo(
    () => (searchQuery ? filterChapters(allChaptersWithId, searchQuery) : allChaptersWithId),
    [searchQuery, allChaptersWithId],
  );

  const navigationUrl = getReciterNavigationUrl(selectedReciter.id.toString());

  return (
    <>
      <NextSeoWrapper
        title={selectedReciter?.translatedName?.name}
        canonical={getCanonicalUrl(lang, navigationUrl)}
        languageAlternates={getLanguageAlternates(navigationUrl)}
        description={t('reciter:reciter-desc', {
          reciterName: selectedReciter?.translatedName?.name,
        })}
      />
      <div className={classNames(layoutStyle.pageContainer)}>
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
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  try {
    const reciterId = params.reciterId as string;

    const reciterData = await getReciterData(reciterId, locale);
    const chaptersData = await getAllChaptersData(locale);

    return {
      props: {
        chaptersData,
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
