import { useCallback } from 'react';

import QuestionsBody from './QuestionsBody';

import useQuestionsPagination from '@/hooks/useQuestionsPagination';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import { makeVerseKey } from '@/utils/verse';

type QuestionsBodyProps = {
  initialChapterId: string;
  initialVerseNumber: string;
  render: (renderProps: { body: JSX.Element }) => JSX.Element;
  initialData?: AyahQuestionsResponse;
};

const QuestionsBodyContainer = ({
  render,
  initialChapterId,
  initialVerseNumber,
  initialData,
}: QuestionsBodyProps) => {
  const verseKey = makeVerseKey(Number(initialChapterId), Number(initialVerseNumber));

  const { questions, hasMore, isLoadingMore, loadMore } = useQuestionsPagination({
    verseKey,
    initialData:
      verseKey === makeVerseKey(Number(initialChapterId), Number(initialVerseNumber))
        ? initialData
        : undefined,
  });

  const renderBody = useCallback(
    () => (
      <QuestionsBody
        questions={questions}
        selectedChapterId={initialChapterId}
        selectedVerseNumber={initialVerseNumber}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
    ),
    [questions, initialChapterId, initialVerseNumber, hasMore, isLoadingMore, loadMore],
  );

  return render({
    body: renderBody(),
  });
};

export default QuestionsBodyContainer;
