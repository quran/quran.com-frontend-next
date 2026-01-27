import React from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import modalStyles from '@/components/Notes/modal/Modal.module.scss';
import feedbackStyles from '@/components/Verse/TranslationFeedback/TranslationFeedbackAction.module.scss';
import TranslationFeedbackModal from '@/components/Verse/TranslationFeedback/TranslationFeedbackModal';
import feedbackModalStyles from '@/components/Verse/TranslationFeedback/TranslationFeedbackModal.module.scss';
import ContentModal from '@/dls/ContentModal/ContentModal';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/icons/arrow.svg';

interface FeedbackModalProps {
  verseKey: string;
  wasOpenedFromStudyMode: boolean;
  onClose: () => void;
  onBack: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  verseKey,
  wasOpenedFromStudyMode,
  onClose,
  onBack,
}) => {
  const { t } = useTranslation();

  const header = wasOpenedFromStudyMode ? (
    <button
      type="button"
      className={classNames(modalStyles.headerButton, modalStyles.title)}
      onClick={onBack}
    >
      <IconContainer
        icon={<ArrowIcon />}
        shouldForceSetColors={false}
        size={IconSize.Custom}
        className={modalStyles.arrowIcon}
      />
      {t('quran-reader:translation-feedback.title')}
    </button>
  ) : (
    <p className={feedbackStyles.title}>{t('quran-reader:translation-feedback.title')}</p>
  );

  return (
    <ContentModal
      isOpen
      header={header}
      hasCloseButton
      onClose={onClose}
      onEscapeKeyDown={onClose}
      overlayClassName={feedbackStyles.overlay}
      headerClassName={feedbackStyles.headerClassName}
      closeIconClassName={feedbackStyles.closeIconContainer}
      contentClassName={classNames(feedbackStyles.content, feedbackStyles.formModalContent)}
      innerContentClassName={classNames(
        feedbackModalStyles.container,
        feedbackStyles.formModalContent,
      )}
    >
      <TranslationFeedbackModal verse={{ verseKey }} onClose={onClose} />
    </ContentModal>
  );
};

export default FeedbackModal;
