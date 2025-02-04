import { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './VerseQuestion.module.scss';

import QuestionAndAnswerPill from '@/components/QuestionAndAnswer/Pill';
import QuestionsModal from '@/components/QuestionAndAnswer/QuestionsModal';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getVerseQuestionsNavigationUrl } from '@/utils/navigation';

type VerseQuestionsProps = {
  verseKey: string;
  isTranslationView: boolean;
  hasQuestions?: boolean;
};

const VerseQuestions: React.FC<VerseQuestionsProps> = ({
  verseKey,
  isTranslationView,
  hasQuestions,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, lang } = useTranslation('common');
  const router = useRouter();

  const onItemClicked = () => {
    logButtonClick('verse_questions', {
      isTranslationView,
    });
    fakeNavigate(getVerseQuestionsNavigationUrl(verseKey), lang);
    setIsModalOpen(true);
  };

  const onClose = () => {
    setIsModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
  };

  return (
    <>
      <QuestionsModal isOpen={isModalOpen} onClose={onClose} verseKey={verseKey} />
      {hasQuestions && (
        <div
          className={styles.questionsContainer}
          onClick={onItemClicked}
          role="button"
          tabIndex={0}
          onKeyDown={onItemClicked}
          aria-label={t('verse-questions')}
        >
          <QuestionAndAnswerPill type={QuestionType.EXPLORE_ANSWERS} />
        </div>
      )}
    </>
  );
};

export default VerseQuestions;
