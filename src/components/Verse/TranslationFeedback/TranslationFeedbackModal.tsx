import React from 'react';

import useTranslation from 'next-translate/useTranslation';

import styles from './TranslationFeedbackModal.module.scss';
import TranslationPreview from './TranslationPreview';
import TranslationSelect from './TranslationSelect';
import useTranslationFeedbackForm from './useTranslationFeedbackForm';

import Button, { ButtonSize } from '@/dls/Button/Button';
import TextArea from '@/dls/Forms/TextArea';

interface TranslationFeedbackModalProps {
  verse: { verseKey: string };
  onClose: () => void;
}

const TranslationFeedbackModal: React.FC<TranslationFeedbackModalProps> = ({ verse, onClose }) => {
  const { t } = useTranslation('common');

  const {
    selectedTranslationId,
    feedback,
    errors,
    isSubmitting,
    selectOptions,
    onSubmit,
    handleTranslationChange,
    handleFeedbackChange,
  } = useTranslationFeedbackForm({ verse, onClose });

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="translation-select" data-testid="translation-select-label">
          {t('translation-feedback.select-translation')}
        </label>

        <TranslationSelect
          selectedTranslationId={selectedTranslationId}
          selectOptions={selectOptions}
          onTranslationChange={handleTranslationChange}
          id="translation-select"
          name="translation-select"
        />
        {errors.translation && (
          <div className={styles.error} data-testid={`translation-error-${errors.translation.id}`}>
            {errors.translation.message}
          </div>
        )}
      </div>

      <TranslationPreview verse={verse} selectedTranslationId={selectedTranslationId} />

      <div className={styles.inputGroup}>
        <TextArea
          id="feedback"
          name="feedback"
          placeholder={t('translation-feedback.placeholder')}
          containerClassName={styles.textArea}
          value={feedback}
          onChange={handleFeedbackChange}
          dataTestId="translation-feedback-textarea"
        />

        {errors.feedback && (
          <div className={styles.error} data-testid={`feedback-error-${errors.feedback.id}`}>
            {errors.feedback.message}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          htmlType="submit"
          isLoading={isSubmitting}
          size={ButtonSize.Small}
          className={styles.reportButton}
          isDisabled={isSubmitting}
          data-testid="translation-feedback-submit-button"
        >
          {t('translation-feedback.report')}
        </Button>
      </div>
    </form>
  );
};

export default TranslationFeedbackModal;
