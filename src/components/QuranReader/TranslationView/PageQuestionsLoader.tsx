/* eslint-disable react/no-multi-comp -- PageQuestionsLoader is a private helper for PageQuestionsLoaders */
import { useEffect } from 'react';

import useCountRangeQuestions from '@/hooks/auth/useCountRangeQuestions';
import { QuestionsData } from '@/utils/auth/api';
import Verse from 'types/Verse';

type PageQuestionsLoaderProps = {
  pageNumber: number;
  verses: Verse[];
  onQuestionsLoaded: (pageNumber: number, data: Record<string, QuestionsData>) => void;
};

// Fetches questions data for a specific page's verses. Renders nothing.
const PageQuestionsLoader = ({
  pageNumber,
  verses,
  onQuestionsLoaded,
}: PageQuestionsLoaderProps): null => {
  const questionsRange =
    verses.length > 0
      ? {
          from: verses[0].verseKey,
          to: verses[verses.length - 1].verseKey,
        }
      : null;

  const { data: questionsData } = useCountRangeQuestions(questionsRange);

  useEffect(() => {
    if (questionsData && Object.keys(questionsData).length > 0) {
      onQuestionsLoaded(pageNumber, questionsData);
    }
  }, [questionsData, pageNumber, onQuestionsLoaded]);

  return null;
};

type PageQuestionsLoadersProps = {
  apiPageToVersesMap: Record<number, Verse[]>;
  onQuestionsLoaded: (pageNumber: number, data: Record<string, QuestionsData>) => void;
};

// Renders a PageQuestionsLoader for each loaded page.
const PageQuestionsLoaders = ({
  apiPageToVersesMap,
  onQuestionsLoaded,
}: PageQuestionsLoadersProps): JSX.Element => {
  return (
    <>
      {Object.entries(apiPageToVersesMap).map(([pageNum, verses]) => (
        <PageQuestionsLoader
          key={pageNum}
          pageNumber={Number(pageNum)}
          verses={verses}
          onQuestionsLoaded={onQuestionsLoaded}
        />
      ))}
    </>
  );
};

export default PageQuestionsLoaders;
