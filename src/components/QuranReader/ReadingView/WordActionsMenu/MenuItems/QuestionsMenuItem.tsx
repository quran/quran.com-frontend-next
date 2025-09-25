import React, { useState } from 'react';

import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import PopoverMenu from '@/components/dls/PopoverMenu/PopoverMenu';
import QuestionsModal from '@/components/QuestionAndAnswer/QuestionsModal';
import { usePageQuestions } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import LightbulbOnIcon from '@/icons/lightbulb-on.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import QuestionType from '@/types/QuestionsAndAnswers/QuestionType';
import { WordVerse } from '@/types/Word';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { fakeNavigate, getVerseAnswersNavigationUrl } from '@/utils/navigation';

interface Props {
  verse: WordVerse;
  onActionTriggered?: () => void;
}

const QuestionsMenuItem: React.FC<Props> = ({ verse, onActionTriggered }) => {
  const questionsData = usePageQuestions();
  const { t, lang } = useTranslation('common');
  const router = useRouter();
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const { verseKey } = verse;
  const hasQuestions = !!questionsData && questionsData[verseKey]?.total > 0;
  const isClarificationQuestion = !!questionsData?.[verseKey]?.types?.[QuestionType.CLARIFICATION];

  const onMenuItemClicked = () => {
    logButtonClick('reading_view_verse_actions_menu_questions');
    setIsContentModalOpen(true);
    fakeNavigate(getVerseAnswersNavigationUrl(verseKey), lang);
  };

  const onModalClose = () => {
    logEvent('reading_view_questions_modal_close');
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
    onActionTriggered?.();
  };

  const onModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  if (hasQuestions) {
    return (
      <>
        <PopoverMenu.Item
          icon={
            isClarificationQuestion ? (
              <LightbulbOnIcon />
            ) : (
              <IconContainer
                icon={<LightbulbIcon />}
                color={IconColor.tertiary}
                size={IconSize.Custom}
              />
            )
          }
          onClick={onMenuItemClicked}
        >
          {t('answers')}
        </PopoverMenu.Item>

        {isContentModalOpen && (
          <QuestionsModal
            isOpen
            onClose={onModalClose}
            verseKey={verseKey}
            onModalClick={onModalClick}
          />
        )}
      </>
    );
  }

  return null;
};

export default QuestionsMenuItem;
