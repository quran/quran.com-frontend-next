import React from 'react';
import { useSelector } from 'react-redux';
import ChapterType from 'types/ChapterType';
import { fetcher } from 'src/api';
import { useSWRInfinite } from 'swr';
import { makeUrl } from 'src/utils/api';
import VerseType from 'types/VerseType';
import QuranPageView from './QuranPageView';
import TranslationView from './TranslationView';
import { selectReadingView } from '../../redux/slices/QuranReader/readingView';
import { ReadingView } from './types';

type QuranReaderProps = {
  initialData: { verses: VerseType[] };
  chapter: ChapterType;
};

const QuranReader = ({ initialData, chapter }: QuranReaderProps) => {
  const { data } = useSWRInfinite(
    (index) => {
      return makeUrl(`/chapters/${chapter.id}/verses`, { translations: 20, page: index }); // TODO: select the translation using the user preference
    },
    fetcher,
    {
      initialData: initialData.verses,
      revalidateOnFocus: false,
    },
  );

  const readingView = useSelector(selectReadingView);

  if (readingView === ReadingView.QuranPage) {
    return <QuranPageView verses={data} />;
  }

  return <TranslationView verses={data} />;
};

export default QuranReader;
