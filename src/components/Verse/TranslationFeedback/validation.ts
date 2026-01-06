import { Translate } from 'next-translate';

import { FormErrorId, TranslationFeedbackFormErrors } from './types';

import { BASE_SERVER_ERRORS_MAP, ServerErrorCodes } from '@/types/auth/error';
import { isValidationError } from '@/utils/error';
import { toLocalizedNumber } from '@/utils/locale';

export const MAX_FEEDBACK_CHARS = 10000;
export const MIN_FEEDBACK_CHARS = 1;

/**
 * Validates feedback field and returns error if any.
 * @returns {FormError | null} Error object or null if valid.
 */
const getFeedbackError = (feedback: string, t: Translate, lang: string) => {
  const feedbackText = t('translation-feedback.feedback');
  const trimmedFeedbackLength = feedback.trim().length;

  if (trimmedFeedbackLength === 0) {
    return {
      id: FormErrorId.RequiredField,
      message: t('validation.required-field', { field: feedbackText }),
    };
  }

  if (trimmedFeedbackLength < MIN_FEEDBACK_CHARS) {
    return {
      id: FormErrorId.MinimumLength,
      message: t('validation.minimum-length', {
        field: feedbackText,
        value: toLocalizedNumber(MIN_FEEDBACK_CHARS, lang),
      }),
    };
  }

  if (trimmedFeedbackLength > MAX_FEEDBACK_CHARS) {
    return {
      id: FormErrorId.MaximumLength,
      message: t('validation.maximum-length', {
        field: feedbackText,
        value: toLocalizedNumber(MAX_FEEDBACK_CHARS, lang),
      }),
    };
  }

  return null;
};

/**
 * Validates translation field and returns error if any.
 * @returns {FormError | null} Error object or null if valid.
 */
const getTranslationError = (selectedTranslationId: string, t: Translate) => {
  const translationText = t('translation-feedback.translation');

  if (!selectedTranslationId) {
    return {
      id: FormErrorId.RequiredField,
      message: t('validation.required-field', { field: translationText }),
    };
  }

  return null;
};

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
  lang: string,
): TranslationFeedbackFormErrors => {
  const errors: TranslationFeedbackFormErrors = {};
  const translationError = getTranslationError(selectedTranslationId, t);
  if (translationError) errors.translation = translationError;
  const feedbackError = getFeedbackError(feedback, t, lang);
  if (feedbackError) errors.feedback = feedbackError;
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

/**
 * Maps FormErrorId to validation translation keys
 */
const FORM_ERROR_ID_TO_TRANSLATION_KEY = {
  [BASE_SERVER_ERRORS_MAP.MAX_LENGTH]: {
    id: FormErrorId.MaximumLength,
    key: 'validation.maximum-length',
    query: (locale: string) => ({ value: toLocalizedNumber(MAX_FEEDBACK_CHARS, locale) }),
  },
  [BASE_SERVER_ERRORS_MAP.MIN_LENGTH]: {
    id: FormErrorId.MinimumLength,
    key: 'validation.minimum-length',
    query: (locale: string) => ({ value: toLocalizedNumber(MIN_FEEDBACK_CHARS, locale) }),
  },
  [BASE_SERVER_ERRORS_MAP.MISSING]: {
    id: FormErrorId.RequiredField,
    key: 'validation.required-field',
    query: () => ({}),
  },
};

const FIELD_KEY_MAP = {
  translationId: 'translation',
  feedback: 'feedback',
};

/**
 * Extracts server validation errors from API response and converts them to form errors.
 * Dynamically handles any validation error code returned by the backend without requiring code changes.
 * New error codes can be handled by adding appropriate translation keys to the locale files.
 *
 * @param {unknown} response - The API error response
 * @param {Translate} t - Translation function for localized error messages
 * @returns {TranslationFeedbackFormErrors | null} Form errors object if validation errors are found, null otherwise
 */
export const getTranslationFeedbackServerErrors = (
  response: unknown,
  t: Translate,
  lang: string,
): TranslationFeedbackFormErrors | null => {
  if (!isValidationError(response)) return null;

  const errors: TranslationFeedbackFormErrors = {};
  const errorFields = response.details.error.details;

  Object.entries(errorFields).forEach(([field, errorCode]) => {
    const fieldKey = FIELD_KEY_MAP[field as keyof typeof FIELD_KEY_MAP];
    if (!fieldKey) return;

    const fieldName = t(`translation-feedback.${fieldKey}`);

    const normalizedErrorCode = String(errorCode).toUpperCase();

    const localizeKey = BASE_SERVER_ERRORS_MAP[normalizedErrorCode as ServerErrorCodes];
    const translationFeedbackError = FORM_ERROR_ID_TO_TRANSLATION_KEY[localizeKey];

    if (translationFeedbackError && localizeKey) {
      errors[fieldKey] = {
        id: translationFeedbackError.id,
        message: t(translationFeedbackError.key, {
          ...translationFeedbackError.query(lang),
          field: fieldName,
        }),
      };
    } else if (localizeKey) {
      // The error is not common Translation Feedback Error, We are fallback to global errors
      const localizeText = t(localizeKey, {
        fieldName,
        min: toLocalizedNumber(MIN_FEEDBACK_CHARS, lang),
        max: toLocalizedNumber(MAX_FEEDBACK_CHARS, lang),
      });

      // If same that means we don't have a translation for this error code
      if (localizeText !== localizeKey) {
        errors[fieldKey] = { id: FormErrorId.UnknownError, message: localizeText };
      }
    }
  });

  return isTranslationFeedbackValid(errors) ? null : errors;
};
