import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import BottomActionsModals, { ModalType } from './BottomActionsModals';
import BottomActionsTabs, { TabId } from './BottomActionsTabs';

import { usePageQuestions } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { logButtonClick } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseAnswersNavigationUrl,
  getVerseLessonNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseSelectedTafsirNavigationUrl,
} from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

/**
 * Props for the BottomActions component
 */
interface BottomActionsProps {
  /**
   * The verse key to display actions for
   */
  verseKey: string;
  /**
   * Whether this is in translation view
   */
  isTranslationView?: boolean;
  /**
   * Whether this verse has questions (passed from parent to ensure memo re-renders)
   */
  hasQuestions?: boolean;
}

/**
 * BottomActions component displays action tabs for a verse
 * @param {BottomActionsProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const BottomActions = ({
  verseKey,
  isTranslationView = true,
  hasQuestions: hasQuestionsProp,
}: BottomActionsProps): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const tafsirs = useSelector(selectSelectedTafsirs);
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const questionsData = usePageQuestions();
  // Use prop if provided (from memoized parent), otherwise compute from context
  // Only show Answers tab when we confirm questions exist (not while loading)
  const hasQuestions = hasQuestionsProp ?? questionsData?.[verseKey]?.total > 0;
  const isClarificationQuestion = !!questionsData?.[verseKey]?.types?.[QuestionType.CLARIFICATION];
  // Modal state using enum (for Answers only now)
  const [openedModal, setOpenedModal] = useState<ModalType | null>(null);

  /**
   * Handle tab click or keyboard event
   * @param {TabId} tabType - Type of tab for logging
   * @param {() => string} navigationFn - Function that returns navigation URL
   * @returns {(e: React.MouseEvent | React.KeyboardEvent) => void} Event handler function
   */
  const createTabHandler = (tabType: TabId, navigationFn: () => string) => {
    return () => {
      // Open Study Mode for tafsir, reflections, and lessons
      if (tabType === TabId.TAFSIR) {
        dispatch(openStudyMode({ verseKey, initialTab: StudyModeTabId.TAFSIR }));
      } else if (tabType === TabId.REFLECTIONS) {
        dispatch(openStudyMode({ verseKey, initialTab: StudyModeTabId.REFLECTIONS }));
      } else if (tabType === TabId.LESSONS) {
        dispatch(openStudyMode({ verseKey, initialTab: StudyModeTabId.LESSONS }));
      } else if (tabType === TabId.ANSWERS) {
        // Answers still uses the separate Q&A modal
        setOpenedModal(ModalType.QUESTIONS);
      }

      logButtonClick(
        `${
          isTranslationView ? 'translation_view' : 'reading_view'
        }_verse_bottom_actions_${tabType}`,
      );

      // Update URL without triggering navigation
      fakeNavigate(navigationFn(), lang);
    };
  };

  // Define tab configurations
  const tabs = [
    {
      id: TabId.TAFSIR,
      label: t('quran-reader:tafsirs'),
      icon: <BookIcon />,
      onClick: createTabHandler(TabId.TAFSIR, () =>
        getVerseSelectedTafsirNavigationUrl(chapterId, Number(verseNumber), tafsirs[0]),
      ),
      condition: true,
    },
    {
      id: TabId.LESSONS,
      label: t('lessons'),
      icon: <GraduationCapIcon />,
      onClick: createTabHandler(TabId.LESSONS, () => getVerseLessonNavigationUrl(verseKey)),
      condition: true,
    },
    {
      id: TabId.REFLECTIONS,
      label: t('reflections'),
      icon: <ChatIcon />,
      onClick: createTabHandler(TabId.REFLECTIONS, () => getVerseReflectionNavigationUrl(verseKey)),
      condition: true,
    },
    {
      id: TabId.ANSWERS,
      label: t('answers'),
      icon: isClarificationQuestion ? <LightbulbOnIcon /> : <LightbulbIcon />,
      onClick: createTabHandler(TabId.ANSWERS, () => getVerseAnswersNavigationUrl(verseKey)),
      condition: hasQuestions,
    },
  ];

  return (
    <>
      <BottomActionsTabs tabs={tabs} isTranslationView={isTranslationView} />

      <BottomActionsModals
        verseKey={verseKey}
        openedModal={openedModal}
        hasQuestions={hasQuestions}
        isTranslationView={isTranslationView}
        onCloseModal={() => setOpenedModal(null)}
      />
    </>
  );
};

export default BottomActions;
