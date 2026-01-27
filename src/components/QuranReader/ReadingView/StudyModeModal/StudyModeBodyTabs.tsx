import { useEffect } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import { StudyModeTabId } from './StudyModeBottomActions';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import useBatchedCountRangeQuestions from '@/hooks/auth/useBatchedCountRangeQuestions';
import BookIcon from '@/icons/book-open.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import RelatedVerseIcon from '@/icons/related-verses.svg';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';

export const StudyModeTafsirTab = dynamic(() => import('./tabs/StudyModeTafsirTab'), {
  loading: TafsirSkeleton,
});

export const StudyModeReflectionsTab = dynamic(() => import('./tabs/StudyModeReflectionsTab'), {
  loading: TafsirSkeleton,
});

export const StudyModeLessonsTab = dynamic(() => import('./tabs/StudyModeLessonsTab'), {
  loading: TafsirSkeleton,
});

export const StudyModeAnswersTab = dynamic(() => import('./tabs/StudyModeAnswersTab'), {
  loading: TafsirSkeleton,
});

export const StudyModeRelatedVersesTab = dynamic(
  () => import('./tabs/RelatedVerses/StudyModeRelatedVersesTab'),
  {
    ssr: false,
    loading: TafsirSkeleton,
  },
);

export const TAB_COMPONENTS: Partial<
  Record<
    StudyModeTabId,
    React.ComponentType<{
      chapterId: string;
      verseNumber: string;
      switchTab?: (tabId: StudyModeTabId | null) => void;
      questionId?: string;
      questionsInitialData?: AyahQuestionsResponse;
      tafsirIdOrSlug?: string;
      onGoToVerse?: (chapterId: string, verseNumber: string) => void;
    }>
  >
> = {
  [StudyModeTabId.TAFSIR]: StudyModeTafsirTab,
  [StudyModeTabId.REFLECTIONS]: StudyModeReflectionsTab,
  [StudyModeTabId.LESSONS]: StudyModeLessonsTab,
  [StudyModeTabId.ANSWERS]: StudyModeAnswersTab,
  [StudyModeTabId.RELATED_VERSES]: StudyModeRelatedVersesTab,
};

export type TabConfig = {
  id: StudyModeTabId;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  condition: boolean;
};

/**
 * Hook to generate tab configuration for StudyModeBottomActions.
 *
 * @param {object} props
 * @param {StudyModeTabId | null | undefined} props.activeTab - Currently active tab
 * @param {string} props.verseKey - Current verse key
 * @param {Function} [props.onTabChange] - Callback when tab is clicked
 * @param {boolean} [props.hasRelatedVerses=false] - Whether the verse has related verses
 * @returns {TabConfig[]} Array of tab configurations
 */
export const useStudyModeTabs = ({
  activeTab,
  verseKey,
  onTabChange,
  hasRelatedVerses = false,
}: {
  activeTab: StudyModeTabId | null | undefined;
  verseKey: string;
  onTabChange?: (tabId: StudyModeTabId | null) => void;
  hasRelatedVerses: boolean;
}): TabConfig[] => {
  const { t } = useTranslation('common');

  const { data: questionData, isLoading: isLoadingQuestions } =
    useBatchedCountRangeQuestions(verseKey);

  // Check if questions exist and their type
  const hasQuestions = questionData?.total > 0 || isLoadingQuestions;
  const isClarificationQuestion = !!questionData?.types?.[QuestionType.CLARIFICATION];

  useEffect(() => {
    if (activeTab === StudyModeTabId.ANSWERS && !hasQuestions) {
      onTabChange?.(null);
    }
  }, [activeTab, hasQuestions, onTabChange]);

  const handleTabClick = (tabId: StudyModeTabId) => {
    const newTab = activeTab === tabId ? null : tabId;
    onTabChange?.(newTab);
  };

  return [
    {
      id: StudyModeTabId.TAFSIR,
      label: t('quran-reader:tafsirs'),
      icon: <BookIcon />,
      onClick: () => handleTabClick(StudyModeTabId.TAFSIR),
      condition: true,
    },
    {
      id: StudyModeTabId.LESSONS,
      label: t('lessons'),
      icon: <GraduationCapIcon />,
      onClick: () => handleTabClick(StudyModeTabId.LESSONS),
      condition: true,
    },
    {
      id: StudyModeTabId.REFLECTIONS,
      label: t('reflections'),
      icon: <LightbulbIcon />,
      onClick: () => handleTabClick(StudyModeTabId.REFLECTIONS),
      condition: true,
    },
    {
      id: StudyModeTabId.ANSWERS,
      label: t('answers'),
      icon: isClarificationQuestion ? <LightbulbOnIcon /> : <LightbulbIcon />,
      onClick: () => handleTabClick(StudyModeTabId.ANSWERS),
      condition: hasQuestions,
    },
    {
      id: StudyModeTabId.RELATED_VERSES,
      label: t('related-verses'),
      icon: <RelatedVerseIcon />,
      onClick: () => handleTabClick(StudyModeTabId.RELATED_VERSES),
      condition: hasRelatedVerses,
    },
  ];
};
