import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';

import BottomActionsTabs, { TabId } from './BottomActionsTabs';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import useBatchedCountRangeHadiths from '@/hooks/auth/useBatchedCountRangeHadiths';
import useBatchedCountRangeQiraat from '@/hooks/auth/useBatchedCountRangeQiraat';
import useBatchedCountRangeQuestions from '@/hooks/auth/useBatchedCountRangeQuestions';
import BookIcon from '@/icons/book-open.svg';
import HadithIcon from '@/icons/bx-book.svg';
import ChatIcon from '@/icons/chat.svg';
import GraduationCapIcon from '@/icons/graduation-cap.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import QiraatIcon from '@/icons/qiraat-icon.svg';
import RelatedVersesIcon from '@/icons/related-verses.svg';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import Language from '@/types/Language';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { logButtonClick } from '@/utils/eventLogger';
import {
  fakeNavigate,
  getVerseAnswersNavigationUrl,
  getVerseHadithsNavigationUrl,
  getVerseLessonNavigationUrl,
  getVerseQiraatNavigationUrl,
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
  /**
   * The class name to apply to the bottom actions container
   */
  className?: string;
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
  className,
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

  // Use backend hadith count to check if hadiths exist for this verse
  const { data: hadithCount } = useBatchedCountRangeHadiths(verseKey, lang as Language);
  const hasHadiths = (hadithCount ?? 0) > 0;

  const createTabHandler = (tabType: TabId, navigationFn: () => string) => {
    return () => {
      const tabIdMap: Record<TabId, StudyModeTabId> = {
        [TabId.TAFSIR]: StudyModeTabId.TAFSIR,
        [TabId.REFLECTIONS]: StudyModeTabId.REFLECTIONS,
        [TabId.LESSONS]: StudyModeTabId.LESSONS,
        [TabId.RELATED_VERSES]: StudyModeTabId.RELATED_VERSES,
        [TabId.ANSWERS]: StudyModeTabId.ANSWERS,
        [TabId.QIRAAT]: StudyModeTabId.QIRAAT,
        [TabId.HADITH]: StudyModeTabId.HADITH,
      };

      const studyModeTab = tabIdMap[tabType];
      if (studyModeTab) {
        dispatch(openStudyMode({ verseKey, activeTab: studyModeTab }));
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
      label: t('quran-reader:qiraat.title'),
      icon: <QiraatIcon color="var(--color-blue-buttons-and-icons)" />,
      onClick: createTabHandler(TabId.QIRAAT, () => getVerseQiraatNavigationUrl(verseKey)),
      condition: hasQiraatData,
    },
    {
      id: TabId.HADITH,
      label: t('quran-reader:hadith.title'),
      icon: <HadithIcon color="var(--color-blue-buttons-and-icons)" />,
      onClick: createTabHandler(TabId.HADITH, () => getVerseHadithsNavigationUrl(verseKey)),
      condition: hasHadiths,
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
    <BottomActionsTabs tabs={tabs} isTranslationView={isTranslationView} className={className} />
  );
};

export default BottomActions;
