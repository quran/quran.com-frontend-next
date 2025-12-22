import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import BottomActionsTabs, { TabId } from './BottomActionsTabs';

import { usePageQuestions } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import useIsMobile, { MobileSizeVariant } from '@/hooks/useIsMobile';
import { useOverlayModal, OverlayType } from '@/hooks/useOverlayModal';
import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { logButtonClick } from '@/utils/eventLogger';
import {
  getVerseAnswersNavigationUrl,
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
}

/**
 * BottomActions component displays action tabs for a verse
 * @param {BottomActionsProps} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const BottomActions = ({ verseKey, isTranslationView = true }: BottomActionsProps): JSX.Element => {
  const { t } = useTranslation('common');
  const tafsirs = useSelector(selectSelectedTafsirs);
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const questionsData = usePageQuestions();
  const hasQuestions = questionsData?.[verseKey]?.total > 0;
  const isClarificationQuestion = !!questionsData?.[verseKey]?.types?.[QuestionType.CLARIFICATION];
  const isMobile = useIsMobile(MobileSizeVariant.SMALL);

  // Use centralized overlay hooks for each modal type
  const tafsirModal = useOverlayModal({ verseKey, overlayType: OverlayType.TAFSIRS });
  const reflectionModal = useOverlayModal({ verseKey, overlayType: OverlayType.REFLECTIONS });
  const questionsModal = useOverlayModal({ verseKey, overlayType: OverlayType.ANSWERS });

  const createTabHandler = (tabType: TabId, navigationFn: () => string, openFn: (url: string) => void) => {
    return () => {
      logButtonClick(
        `${
          isTranslationView ? 'translation_view' : 'reading_view'
        }_verse_bottom_actions_${tabType}`,
      );

      openFn(navigationFn());
    };
  };

  // Define tab configurations
  const tabs = [
    {
      id: TabId.TAFSIR,
      label: t('quran-reader:tafsirs'),
      icon: <BookIcon />,
      onClick: createTabHandler(
        TabId.TAFSIR,
        () => getVerseSelectedTafsirNavigationUrl(chapterId, Number(verseNumber), tafsirs[0]),
        tafsirModal.open,
      ),
      condition: true,
    },
    {
      id: TabId.REFLECTIONS,
      label: isMobile ? t('reflections') : t('reflections-and-lessons'),
      icon: <ChatIcon />,
      onClick: createTabHandler(
        TabId.REFLECTIONS,
        () => getVerseReflectionNavigationUrl(verseKey),
        reflectionModal.open,
      ),
      condition: true,
    },
    {
      id: TabId.ANSWERS,
      label: t('answers'),
      icon: isClarificationQuestion ? <LightbulbOnIcon /> : <LightbulbIcon />,
      onClick: createTabHandler(
        TabId.ANSWERS,
        () => getVerseAnswersNavigationUrl(verseKey),
        questionsModal.open,
      ),
      condition: hasQuestions,
    },
  ];

  return <BottomActionsTabs tabs={tabs} isTranslationView={isTranslationView} />;
};

export default BottomActions;
