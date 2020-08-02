import React from 'react';
import { useSelector } from 'react-redux';
import { camelizeKeys } from 'humps';
import InfiniteScroll from 'react-infinite-scroller';
import { makeUrl } from 'src/utils/api';
import { useSWRInfinite } from 'swr';
import { VersesResponse } from 'types/APIResponses';
import ChapterType from 'types/ChapterType';
import styled from 'styled-components';
import { selectReadingView } from '../../redux/slices/QuranReader/readingView';
import PageView from './PageView';
import TranslationView from './TranslationView';
import { ReadingView } from './types';

type QuranReaderProps = {
  initialData: VersesResponse;
  chapter: ChapterType;
};

const INFINITE_SCROLLER_THRESHOLD = 2000; // Number of pixels before the sentinel reaches the viewport to trigger loadMore()

/**
 * A custom fetcher that returns the verses array from the api result.
 * We need this workaround as useSWRInfinite requires the data from the api
 * to be an array, while the result we get is formatted as {meta: {}, verses: Verse[]}
 */
const verseFetcher = async (input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  return res.json().then((data) => camelizeKeys(data.verses));
};

const QuranReader = ({ initialData, chapter }: QuranReaderProps) => {
  const { data, size, setSize, isValidating } = useSWRInfinite(
    (index) => {
      return makeUrl(`/chapters/${chapter.id}/verses`, {
        translations: 20,
        page: index + 1,
        limit: 25,
      }); // TODO: select the translation using the user preference
    },
    verseFetcher,
    {
      initialData: initialData.verses,
      revalidateOnFocus: true,
    },
  );
  const readingView = useSelector(selectReadingView);
  const pageLimit = initialData.meta.totalPages;
  const verses = data.flat(1);
  let view;

  if (readingView === ReadingView.QuranPage) {
    view = <PageView verses={verses} />;
  } else {
    view = <TranslationView verses={verses} />;
  }

  return (
    <StyledInfiniteScroll
      initialLoad={false}
      threshold={INFINITE_SCROLLER_THRESHOLD}
      hasMore={size < pageLimit}
      loadMore={() => {
        if (!isValidating) {
          setSize(size + 1);
        }
      }}
    >
      {view}
    </StyledInfiniteScroll>
  );
};

const StyledInfiniteScroll = styled(InfiniteScroll)`
  width: 100%;
`;

export default QuranReader;
