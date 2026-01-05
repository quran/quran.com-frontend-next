import { Translate } from 'next-translate';

import { TranslationFeedbackFormErrors } from './types';

export const MAX_FEEDBACK_CHARS = 10000;
export const MIN_FEEDBACK_CHARS = 1;

/**
 * Build translation feedback validation errors for the current form state.
 *
 * @param {string} selectedTranslationId - The translation id chosen by the user.
 * @param {string} feedback - The free-text feedback the user entered.
 * @param {Translate} t - Translation function for localized validation messages.
 * @returns {TranslationFeedbackFormErrors} An errors object keyed by field when validation fails.
 */
export const getTranslationFeedbackErrors = (
  selectedTranslationId: string,
  feedback: string,
  t: Translate,
): TranslationFeedbackFormErrors => {
  const errors: TranslationFeedbackFormErrors = {};
  const trimmedFeedbackLength = feedback.trim().length;

  if (!selectedTranslationId) {
    errors.translation = t('validation.required-field', {
      field: t('translation-feedback.translation'),
    });
  }

  if (trimmedFeedbackLength === 0) {
    errors.feedback = t('validation.required-field', {
      field: t('translation-feedback.feedback'),
    });
  } else if (trimmedFeedbackLength < MIN_FEEDBACK_CHARS) {
    errors.feedback = t('validation.minimum-length', {
      field: t('translation-feedback.feedback'),
      value: MIN_FEEDBACK_CHARS,
    });
  } else if (trimmedFeedbackLength > MAX_FEEDBACK_CHARS) {
    errors.feedback = t('validation.maximum-length', {
      field: t('translation-feedback.feedback'),
      value: MAX_FEEDBACK_CHARS,
    });
  }

  return errors;
};

/**
 * Check if the translation feedback form is free of validation errors.
 *
 * @param {TranslationFeedbackFormErrors} errors - Errors keyed by field returned from validation.
 * @returns {boolean} True when no validation errors are present.
 */
export const isTranslationFeedbackValid = (errors: TranslationFeedbackFormErrors) =>
  Object.keys(errors).length === 0;
