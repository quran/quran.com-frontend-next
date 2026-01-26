import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import BottomActionsTabs, { TabId } from './BottomActionsTabs';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import useBatchedCountRangeQiraat from '@/hooks/auth/useBatchedCountRangeQiraat';
import useBatchedCountRangeQuestions from '@/hooks/auth/useBatchedCountRangeQuestions';
import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import QiraatIcon from '@/icons/qiraat-icon.svg';
import RelatedVersesIcon from '@/icons/related-verses.svg';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { logButtonClick } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseAnswersNavigationUrl,
  getVerseLessonNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseRelatedVerseNavigationUrl,
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
   * Whether this verse has related verses
   */
  hasRelatedVerses?: boolean;
}

/**
 * BottomActions component displays action tabs for a verse
 * @param {BottomActionsProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const BottomActions = ({
  verseKey,
  isTranslationView = true,
  hasRelatedVerses = false,
}: BottomActionsProps): JSX.Element => {
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const tafsirs = useSelector(selectSelectedTafsirs);
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);

  // Fetch questions data directly - SWR handles deduplication automatically
  const { data: questionsData } = useBatchedCountRangeQuestions(verseKey);

  // Only show Answers tab when we confirm questions exist
  const hasQuestions = questionsData?.total > 0;
  const isClarificationQuestion = !!questionsData?.types?.[QuestionType.CLARIFICATION];

  // Use backend qiraat count to check if qiraat exist for this verse
  const { data: qiraatCount } = useBatchedCountRangeQiraat(verseKey);
  const hasQiraatData = (qiraatCount ?? 0) > 0;

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
        dispatch(openStudyMode({ verseKey, activeTab: StudyModeTabId.TAFSIR }));
      } else if (tabType === TabId.REFLECTIONS) {
        dispatch(openStudyMode({ verseKey, activeTab: StudyModeTabId.REFLECTIONS }));
      } else if (tabType === TabId.LESSONS) {
        dispatch(openStudyMode({ verseKey, activeTab: StudyModeTabId.LESSONS }));
      } else if (tabType === TabId.RELATED_VERSES) {
        dispatch(openStudyMode({ verseKey, activeTab: StudyModeTabId.RELATED_VERSES }));
      } else if (tabType === TabId.ANSWERS) {
        dispatch(openStudyMode({ verseKey, activeTab: StudyModeTabId.ANSWERS }));
      } else if (tabType === TabId.QIRAAT) {
        dispatch(openStudyMode({ verseKey, activeTab: StudyModeTabId.QIRAAT }));
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
    {
      id: TabId.QIRAAT,
      label: t('qiraat.title'),
      icon: <QiraatIcon color="var(--color-blue-buttons-and-icons)" />,
      onClick: createTabHandler(TabId.QIRAAT, () => `/${chapterId}/${verseNumber}`),
      condition: hasQiraatData,
    },
    {
      id: TabId.RELATED_VERSES,
      label: t('related-verses'),
      icon: <RelatedVersesIcon />,
      onClick: createTabHandler(TabId.RELATED_VERSES, () =>
        getVerseRelatedVerseNavigationUrl(verseKey),
      ),
      condition: hasRelatedVerses,
    },
  ];

  return (
    <>
      <BottomActionsTabs tabs={tabs} isTranslationView={isTranslationView} />
    </>
  );
};

export default BottomActions;
