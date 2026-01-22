import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import styles from './VerseQuestion.module.scss';

import QuestionAndAnswerPill from '@/components/QuestionAndAnswer/Pill';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getVerseAnswersNavigationUrl } from '@/utils/navigation';

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
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();

  const onItemClicked = () => {
    logButtonClick('verse_questions', {
      isTranslationView,
    });
    dispatch(openStudyMode({ verseKey, activeTab: StudyModeTabId.ANSWERS }));
    fakeNavigate(getVerseAnswersNavigationUrl(verseKey), lang);
  };

  return (
    <>
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
