import React, { useCallback, useMemo } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useSelector } from 'react-redux';

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
  const router = useRouter();
  const tafsirs = useSelector(selectSelectedTafsirs);
  const [chapterId, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const questionsData = usePageQuestions();
  const hasQuestions = questionsData?.[verseKey]?.total > 0;
  const isClarificationQuestion = !!questionsData?.[verseKey]?.types?.[QuestionType.CLARIFICATION];
  const isMobile = useIsMobile(MobileSizeVariant.SMALL);

  const createTabHandler = useCallback(
    (tabType: TabId, navigationFn: () => string) => {
      return () => {
        logButtonClick(
          `${
            isTranslationView ? 'translation_view' : 'reading_view'
          }_verse_bottom_actions_${tabType}`,
        );

        router.push(navigationFn(), undefined, { shallow: true });
      };
    },
    [router, isTranslationView],
  );

  // Define tab configurations
  const tabs = useMemo(
    () => [
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
        onClick: createTabHandler(TabId.REFLECTIONS, () =>
          getVerseReflectionNavigationUrl(verseKey),
        ),
        condition: true,
      },
      {
        id: TabId.ANSWERS,
        label: t('answers'),
        icon: isClarificationQuestion ? <LightbulbOnIcon /> : <LightbulbIcon />,
        onClick: createTabHandler(TabId.ANSWERS, () => getVerseAnswersNavigationUrl(verseKey)),
        condition: hasQuestions,
      },
    ],
    [
      t,
      isMobile,
      createTabHandler,
      chapterId,
      verseNumber,
      tafsirs,
      verseKey,
      isClarificationQuestion,
      hasQuestions,
    ],
  );

  return <BottomActionsTabs tabs={tabs} isTranslationView={isTranslationView} />;
};

export default BottomActions;
