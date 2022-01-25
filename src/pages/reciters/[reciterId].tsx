/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-lines */
import { useState, useMemo } from 'react';

import classNames from 'classnames';
import Fuse from 'fuse.js';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import SearchIcon from '../../../public/icons/search.svg';
import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import { getReciterData } from 'src/api';
import Footer from 'src/components/dls/Footer/Footer';
import Input from 'src/components/dls/Forms/Input';
import ChapterList from 'src/components/Reciter/ChapterList';
import ReciterInfo from 'src/components/Reciter/ReciterInfo';
import { makeReciterUrl } from 'src/utils/apiPaths';
import { getAllChaptersData } from 'src/utils/chapter';
import { logEmptySearchResults } from 'src/utils/eventLogger';
import Chapter from 'types/Chapter';

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

const Reciterpage = () => {
  const allChapterData = getAllChaptersData();
  const router = useRouter();
  const { t } = useTranslation();

  const reciterId = router.query.reciterId as string;

  const { data } = useSWR(makeReciterUrl(reciterId), async () => {
    return getReciterData(reciterId);
  });

  const selectedReciter = data?.reciter;

  const [searchQuery, setSearchQuery] = useState('');

  const allChaptersWithId = useMemo(
    () =>
      Object.entries(allChapterData).map(([chapterId, chapter]) => {
        return {
          id: chapterId.toString(),
          ...chapter,
        };
      }),
    [allChapterData],
  );

  const filteredChapters = useMemo(
    () => (searchQuery ? filterChapters(allChaptersWithId, searchQuery) : allChaptersWithId),
    [searchQuery, allChaptersWithId],
  );

  return (
    <div className={classNames(layoutStyle.pageContainer)}>
      <div className={classNames(layoutStyle.flowItem, pageStyle.headerContainer)}>
        {selectedReciter && <ReciterInfo selectedReciter={selectedReciter} />}
      </div>

      <div className={classNames(layoutStyle.flowItem, pageStyle.searchContainer)}>
        <Input
          prefix={<SearchIcon />}
          id="translations-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('common:settings.search-reciter')}
          fixedWidth={false}
        />
      </div>

      <div className={classNames(layoutStyle.flowItem)}>
        {selectedReciter && (
          <ChapterList filteredChapters={filteredChapters} selectedReciter={selectedReciter} />
        )}
      </div>

      <div className={classNames(layoutStyle.flowItem, pageStyle.footerContainer)}>
        <Footer />
      </div>
    </div>
  );
};

export default Reciterpage;
