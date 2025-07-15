import React, { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

import BottomActionsModals, { ModalType } from './BottomActionsModals';
import BottomActionsTabs, { TabId } from './BottomActionsTabs';

import { usePageQuestions } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import useIsMobile, { MobileSizeVariant } from '@/hooks/useIsMobile';
import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import { selectSelectedTafsirs } from '@/redux/slices/QuranReader/tafsirs';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { logButtonClick } from '@/utils/eventLogger';
import {
  fakeNavigate,
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
  const { t, lang } = useTranslation('common');
  const tafsirs = useSelector(selectSelectedTafsirs);
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const questionsData = usePageQuestions();
  const hasQuestions = questionsData?.[verseKey]?.total > 0;
  const isClarificationQuestion = !!questionsData?.[verseKey]?.types?.[QuestionType.CLARIFICATION];
  const isMobile = useIsMobile(MobileSizeVariant.SMALL);
  // Modal state using enum
  const [openedModal, setOpenedModal] = useState<ModalType | null>(null);

  /**
   * Handle tab click or keyboard event
   * @param {TabId} tabType - Type of tab for logging
   * @param {() => string} navigationFn - Function that returns navigation URL
   * @returns {(e: React.MouseEvent | React.KeyboardEvent) => void} Event handler function
   */
  const createTabHandler = (tabType: TabId, navigationFn: () => string) => {
    return () => {
      // Open the corresponding modal
      if (tabType === TabId.TAFSIR) {
        setOpenedModal(ModalType.TAFSIR);
      } else if (tabType === TabId.REFLECTIONS) {
        setOpenedModal(ModalType.REFLECTION);
      } else if (tabType === TabId.ANSWERS) {
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
      id: TabId.REFLECTIONS,
      label: isMobile ? t('reflections') : t('reflections-and-lessons'),
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
        chapterId={chapterId}
        verseNumber={verseNumber}
        verseKey={verseKey}
        tafsirs={tafsirs}
        openedModal={openedModal}
        hasQuestions={hasQuestions}
        isTranslationView={isTranslationView}
        onCloseModal={() => setOpenedModal(null)}
      />
    </>
  );
};

export default BottomActions;
