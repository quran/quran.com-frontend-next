import React, { useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import styles from './QuestionsButton.module.scss';

import QuestionsModal from '@/components/QuestionAndAnswer/QuestionsModal';
import { usePageQuestions } from '@/components/QuranReader/ReadingView/context/PageQuestionsContext';
import translationViewStyles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import ScholarsSayIcon from '@/icons/lighbulb.svg';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { fakeNavigate, getVerseQuestionsNavigationUrl } from '@/utils/navigation';

interface Props {
  verseKey: string;
  onActionTriggered?: () => void;
}

const QuestionsButton: React.FC<Props> = ({ verseKey, onActionTriggered }) => {
  const pageQuestionsCount = usePageQuestions();
  const { t, lang } = useTranslation('quran-reader');
  const router = useRouter();
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const hasQuestions = pageQuestionsCount && pageQuestionsCount[verseKey] > 0;
  const onButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    logButtonClick(`reading_view_verse_actions_menu_questions`);
    setIsContentModalOpen(true);
    fakeNavigate(getVerseQuestionsNavigationUrl(verseKey), lang);
  };

  const onModalClose = () => {
    logEvent('reading_view_questions_modal_close');
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  const onModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  if (hasQuestions) {
    return (
      <>
        <Button
          variant={ButtonVariant.Ghost}
          onClick={onButtonClicked}
          size={ButtonSize.Small}
          tooltip={t('q-and-a.questions')}
          shouldFlipOnRTL={false}
          shape={ButtonShape.Circle}
          className={classNames(
            translationViewStyles.iconContainer,
            translationViewStyles.verseAction,
          )}
          ariaLabel={t('q-and-a.questions')}
        >
          <span className={classNames(styles.container, translationViewStyles.icon)}>
            <ScholarsSayIcon />
          </span>
        </Button>
        <QuestionsModal
          isOpen={isContentModalOpen}
          onClose={onModalClose}
          verseKey={verseKey}
          onModalClick={onModalClick}
        />
      </>
    );
  }

  return null;
};

export default QuestionsButton;
