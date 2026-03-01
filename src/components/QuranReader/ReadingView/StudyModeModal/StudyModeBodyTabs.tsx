/* eslint-disable max-lines */
import { useLayoutEffect } from 'react';

import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import { StudyModeTabId } from './StudyModeBottomActions';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import useBatchedCountRangeHadiths from '@/hooks/auth/useBatchedCountRangeHadiths';
import useBatchedCountRangeLayeredTranslations from '@/hooks/auth/useBatchedCountRangeLayeredTranslations';
import useBatchedCountRangeQiraat from '@/hooks/auth/useBatchedCountRangeQiraat';
import useBatchedCountRangeQuestions from '@/hooks/auth/useBatchedCountRangeQuestions';
import BookIcon from '@/icons/book-open.svg';
import HadithIcon from '@/icons/bx-book.svg';
import ChatIcon from '@/icons/chat.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LayerIcon from '@/icons/layer.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import QiraatIcon from '@/icons/qiraat-icon.svg';
import RelatedVerseIcon from '@/icons/related-verses.svg';
import { AyahHadithsResponse } from '@/types/Hadith';
import AyahQuestionsResponse from '@/types/QuestionsAndAnswers/AyahQuestionsResponse';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { toLocalizedNumber } from '@/utils/locale';

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

const StudyModeLayersTab = dynamic(() => import('./tabs/StudyModeLayersTab'), {
  loading: TafsirSkeleton,
});

const StudyModeQiraatTab = dynamic(() => import('./tabs/StudyModeQiraatTab'), {
  loading: TafsirSkeleton,
});

const StudyModeHadithTab = dynamic(() => import('./tabs/Hadith'), { loading: TafsirSkeleton });

export const StudyModeRelatedVersesTab = dynamic(
  () => import('./tabs/StudyModeRelatedVerses/StudyModeRelatedVersesTab'),
  { loading: TafsirSkeleton },
);

interface TabProps {
  chapterId: string;
  verseNumber: string;
  switchTab?: (tabId: StudyModeTabId | null) => void;
  questionId?: string;
  questionsInitialData?: AyahQuestionsResponse;
  tafsirIdOrSlug?: string;
  hadithsInitialData?: AyahHadithsResponse;
  onGoToVerse?: (chapterId: string, verseNumber: string, previousVerseKey?: string) => void;
  setRelatedVersesCount?: (count: number) => void;
}

export const TAB_COMPONENTS: Partial<Record<StudyModeTabId, React.ComponentType<TabProps>>> = {
  [StudyModeTabId.TAFSIR]: StudyModeTafsirTab,
  [StudyModeTabId.LAYERS]: StudyModeLayersTab,
  [StudyModeTabId.REFLECTIONS]: StudyModeReflectionsTab,
  [StudyModeTabId.LESSONS]: StudyModeLessonsTab,
  [StudyModeTabId.ANSWERS]: StudyModeAnswersTab,
  [StudyModeTabId.QIRAAT]: StudyModeQiraatTab,
  [StudyModeTabId.RELATED_VERSES]: StudyModeRelatedVersesTab,
  [StudyModeTabId.HADITH]: StudyModeHadithTab,
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
 * @param {number | null} [props.relatedVersesCount] - Count of related verses
 * @returns {TabConfig[]} Array of tab configurations
 */
export const useStudyModeTabs = ({
  activeTab,
  verseKey,
  onTabChange,
  hasRelatedVerses = false,
  relatedVersesCount,
}: {
  activeTab: StudyModeTabId | null | undefined;
  verseKey: string;
  onTabChange?: (tabId: StudyModeTabId | null) => void;
  hasRelatedVerses: boolean;
  relatedVersesCount?: number | null;
}): TabConfig[] => {
  const { t, lang } = useTranslation('common');

  const { data: questionData, isLoading: isQnaLoading } = useBatchedCountRangeQuestions(verseKey);
  const hasQuestions = questionData?.total > 0 || isQnaLoading;
  const isClarificationQuestion = !!questionData?.types?.[QuestionType.CLARIFICATION];

  const { data: qiraatCount, isLoading: isLoadingQiraat } = useBatchedCountRangeQiraat(verseKey);
  const hasQiraat = (qiraatCount ?? 0) > 0 || isLoadingQiraat;
  const { data: layersCount, isLoading: isLoadingLayers } =
    useBatchedCountRangeLayeredTranslations(verseKey);
  const hasLayers = (layersCount ?? 0) > 0 || isLoadingLayers;

  const { data: hadithCount, isLoading: isLoadingHadiths } = useBatchedCountRangeHadiths(verseKey);
  const hasHadiths = (hadithCount ?? 0) > 0 || isLoadingHadiths;

  // Used flushSync to wrap the onTabChange(null) calls, ensuring React performs the state update synchronously and triggers an immediate rerender.
  useLayoutEffect(() => {
    if (activeTab === StudyModeTabId.ANSWERS && !hasQuestions) onTabChange?.(null);
    if (activeTab === StudyModeTabId.QIRAAT && !hasQiraat) onTabChange?.(null);
    if (activeTab === StudyModeTabId.HADITH && !hasHadiths) onTabChange?.(null);
    if (activeTab === StudyModeTabId.LAYERS && !hasLayers) onTabChange?.(null);
  }, [activeTab, hasQuestions, hasQiraat, hasHadiths, hasLayers, onTabChange]);

  const handleTabClick = (tabId: StudyModeTabId) => {
    const newTab = activeTab === tabId ? null : tabId;
    onTabChange?.(newTab);
  };

  return [
    {
      id: StudyModeTabId.TAFSIR,
      label: t('quran-reader:tafsirs'),
      icon: <BookIcon color="var(--color-blue-buttons-and-icons)" />,
      onClick: () => handleTabClick(StudyModeTabId.TAFSIR),
      condition: true,
    },
    {
      id: StudyModeTabId.LAYERS,
      label: t('quran-reader:layers.title'),
      icon: <LayerIcon />,
      onClick: () => handleTabClick(StudyModeTabId.LAYERS),
      condition: hasLayers,
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
      icon: <ChatIcon />,
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
      id: StudyModeTabId.QIRAAT,
      label: t('quran-reader:qiraat.title'),
      icon: <QiraatIcon color="var(--color-blue-buttons-and-icons)" />,
      onClick: () => handleTabClick(StudyModeTabId.QIRAAT),
      condition: hasQiraat,
    },
    {
      id: StudyModeTabId.HADITH,
      label: t('quran-reader:hadith.title'),
      icon: <HadithIcon color="var(--color-blue-buttons-and-icons)" />,
      onClick: () => handleTabClick(StudyModeTabId.HADITH),
      condition: hasHadiths,
    },
    {
      id: StudyModeTabId.RELATED_VERSES,
      label: relatedVersesCount
        ? `${t('related-verses')} (${toLocalizedNumber(relatedVersesCount, lang)})`
        : t('related-verses'),
      icon: <RelatedVerseIcon />,
      onClick: () => handleTabClick(StudyModeTabId.RELATED_VERSES),
      condition: hasRelatedVerses,
    },
  ];
};
