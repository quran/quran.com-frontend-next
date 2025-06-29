/**
 * @deprecated This component is being replaced by BottomActions component which now handles
 * the rendering of questions/answers modals directly. This component is kept for backward compatibility
 * and will be removed in a future release.
 *
 * QuestionsButton renders a button that opens a questions modal when clicked.
 * It updates the URL via fakeNavigate to reflect the questions state without triggering
 * a full page navigation.
 */
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
import { fakeNavigate, getVerseAnswersNavigationUrl } from '@/utils/navigation';

/**
 * Props for the QuestionsButton component
 * @typedef {object} Props
 * @property {string} verseKey - The verse key to show questions for
 * @property {Function} [onActionTriggered] - Callback for when the action is triggered
 */
interface Props {
  verseKey: string;
  onActionTriggered?: () => void;
}

/**
 * @deprecated Use BottomActions component instead which now handles questions modals directly
 *
 * Button component that opens a questions modal when clicked
 * @param {Props} props - Component props
 * @returns {JSX.Element} The rendered component
 */
const QuestionsButton: React.FC<Props> = ({ verseKey, onActionTriggered }) => {
  const pageQuestionsCount = usePageQuestions();
  const { t, lang } = useTranslation('quran-reader');
  const router = useRouter();
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const hasQuestions = !!pageQuestionsCount && pageQuestionsCount[verseKey].total > 0;
  /**
   * Handles button click event
   * Opens the questions modal and updates the URL via fakeNavigate
   * @param {React.MouseEvent<HTMLButtonElement>} e - Click event
   */
  const onButtonClicked = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    logButtonClick(`reading_view_verse_actions_menu_questions`);
    setIsContentModalOpen(true);
    fakeNavigate(getVerseAnswersNavigationUrl(verseKey), lang);
  };

  /**
   * Handles modal close event
   * Logs the event, closes the modal, resets the URL, and calls the onActionTriggered callback
   */
  const onModalClose = () => {
    logEvent('reading_view_questions_modal_close');
    setIsContentModalOpen(false);
    fakeNavigate(router.asPath, router.locale);
    onActionTriggered?.();
  };

  /**
   * Prevents event propagation when modal is clicked
   * @param {React.MouseEvent} e - Click event
   */
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
