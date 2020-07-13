import React from 'react';
import { useSelector } from 'react-redux';
import ChapterType from 'types/ChapterType';
import { useSWRInfinite } from 'swr';
import { makeUrl } from 'src/utils/api';
import VerseType from 'types/VerseType';
import { InfiniteScroll } from 'react-simple-infinite-scroll';
import { camelizeKeys } from 'humps';
import QuranPageView from './QuranPageView';
import TranslationView from './TranslationView';
import { selectReadingView } from '../../redux/slices/QuranReader/readingView';
import { ReadingView } from './types';

type QuranReaderProps = {
  initialData: { verses: VerseType[] };
  chapter: ChapterType;
};

// TODO: document
const verseFetcher = async function (input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  return res.json().then((data) => camelizeKeys(data.verses));
};

// TODO: add stopping point
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
      hasMore
      onLoadMore={() => setSize(size + 1)}
    >
      {view}
    </InfiniteScroll>
  );
};

export default QuranReader;
