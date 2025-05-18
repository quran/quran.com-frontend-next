import dynamic from 'next/dynamic';

import styles from './QuestionsModal.module.scss';

import Spinner from '@/dls/Spinner/Spinner';
import useQuestionsPagination from '@/hooks/useQuestionsPagination';

interface Props {
  verseKey?: string;
}

const QuestionsList = dynamic(() => import('@/components/QuestionAndAnswer/QuestionsList'), {
  loading: () => (
    <div className={styles.content}>
      <Spinner />
    </div>
  ),
  ssr: false, // Disable server-side rendering for modal content
});

const ModalContent: React.FC<Props> = ({ verseKey }) => {
  const { questions, hasMore, isLoadingMore, loadMore } = useQuestionsPagination({
    verseKey,
  });

  return (
    <div className={styles.content}>
      <QuestionsList
        questions={questions}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};

export default ModalContent;
