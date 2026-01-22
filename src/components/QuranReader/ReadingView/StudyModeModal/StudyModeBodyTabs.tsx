import dynamic from 'next/dynamic';
import useTranslation from 'next-translate/useTranslation';

import { StudyModeTabId } from './StudyModeBottomActions';

import TafsirSkeleton from '@/components/QuranReader/TafsirView/TafsirSkeleton';
import BookIcon from '@/icons/book-open.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';

export const StudyModeTafsirTab = dynamic(() => import('./tabs/StudyModeTafsirTab'), {
  ssr: false,
  loading: TafsirSkeleton,
});

export const StudyModeReflectionsTab = dynamic(() => import('./tabs/StudyModeReflectionsTab'), {
  ssr: false,
  loading: TafsirSkeleton,
});

export const StudyModeLessonsTab = dynamic(() => import('./tabs/StudyModeLessonsTab'), {
  ssr: false,
  loading: TafsirSkeleton,
});

export const TAB_COMPONENTS: Partial<
  Record<StudyModeTabId, React.ComponentType<{ chapterId: string; verseNumber: string }>>
> = {
  [StudyModeTabId.TAFSIR]: StudyModeTafsirTab,
  [StudyModeTabId.REFLECTIONS]: StudyModeReflectionsTab,
  [StudyModeTabId.LESSONS]: StudyModeLessonsTab,
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
 * @param {StudyModeTabId | null | undefined} activeTab - Currently active tab
 * @param {Function} onTabChange - Callback when tab is clicked
 * @returns {TabConfig[]} Array of tab configurations
 */
export const useStudyModeTabs = (
  activeTab: StudyModeTabId | null | undefined,
  onTabChange?: (tabId: StudyModeTabId | null) => void,
): TabConfig[] => {
  const { t } = useTranslation('common');

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
  ];
};
