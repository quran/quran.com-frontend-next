import React from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import { usePageQuestions } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import { openStudyMode } from '@/redux/slices/QuranReader/studyMode';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { logButtonClick } from '@/utils/eventLogger';
import { fakeNavigate, getVerseAnswersNavigationUrl } from '@/utils/navigation';
import Verse from 'types/Verse';

interface Props {
  verse: Verse;
  onActionTriggered?: () => void;
}

const QuestionsMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const questionsData = usePageQuestions();
  const { t, lang } = useTranslation('common');
  const dispatch = useDispatch();
  const { verseKey } = verse;
  const hasQuestions = !!questionsData && questionsData[verseKey]?.total > 0;
  const isClarificationQuestion = !!questionsData?.[verseKey]?.types?.[QuestionType.CLARIFICATION];

  const onMenuItemClicked = () => {
    logButtonClick('reading_view_verse_actions_menu_questions');
    dispatch(openStudyMode({ verseKey, activeTab: StudyModeTabId.ANSWERS }));
    fakeNavigate(getVerseAnswersNavigationUrl(verseKey), lang);
    onActionTriggered?.();
  };

  if (hasQuestions) {
    return (
      <PopoverMenu.Item
        icon={
          isClarificationQuestion ? (
            <LightbulbOnIcon />
          ) : (
            <IconContainer
              icon={<LightbulbIcon />}
              color={IconColor.tertiary}
              size={IconSize.Custom}
              shouldFlipOnRTL={false}
            />
          )
        }
        onClick={onMenuItemClicked}
      >
        {t('answers')}
      </PopoverMenu.Item>
    );
  }

  return null;
};

export default QuestionsMenuItem;
