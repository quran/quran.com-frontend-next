import React from 'react';
import { useSelector } from 'react-redux';
import ChapterType from 'types/ChapterType';
import { useSWRInfinite } from 'swr';
import { makeUrl } from 'src/utils/api';
import { InfiniteScroll } from 'react-simple-infinite-scroll';
import { camelizeKeys } from 'humps';
import { VersesResponse } from 'types/APIResponses';
import QuranPageView from './QuranPageView';
import TranslationView from './TranslationView';
import { selectReadingView } from '../../redux/slices/QuranReader/readingView';
import { ReadingView } from './types';

type QuranReaderProps = {
  initialData: VersesResponse;
  chapter: ChapterType;
};

/**
 * A custom fetcher that returns the verses array from the api result.
 * We need this workaround as useSWRInfinite requires the data from the api
 * to be an array, while the result we get is formatted as {meta: {}, verses: Verse[]}
 */
const verseFetcher = async function (input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  return res.json().then((data) => camelizeKeys(data.verses));
};

const QuranReader = ({ initialData, chapter }: QuranReaderProps) => {
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) => {
      return makeUrl(`/chapters/${chapter.id}/verses`, { translations: 20, page: index + 1 }); // TODO: select the translation using the user preference
    },
    verseFetcher,
    {
      initialData: initialData.verses,
      revalidateOnFocus: true,
    },
  );
  const readingView = useSelector(selectReadingView);
  const pageLimit = initialData.meta.totalPages;

  let view;
  if (readingView === ReadingView.QuranPage) {
    view = <QuranPageView verses={data.flat(1)} />;
  } else {
    view = <TranslationView verses={data.flat(1)} />;
  }

  return (
    <InfiniteScroll
      throttle={100}
      threshold={2000}
      isLoading={isValidating}
      hasMore={size < pageLimit}
      onLoadMore={() => setSize(size + 1)}
    >
      {view}
    </InfiniteScroll>
  );
};

export default QuranReader;
