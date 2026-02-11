import { Translate } from 'next-translate';

import { BASE_SERVER_ERRORS_MAP, ServerErrorCodes } from '@/types/auth/error';
import { isValidationError } from '@/utils/error';
import { toLocalizedNumber } from '@/utils/locale';

export const MIN_NOTE_LENGTH = 6;
export const MAX_NOTE_LENGTH = 10000;

/**
 * Checks if an unknown response has a `success` key and determines success status.
 *
 * - If `success` key does NOT exist → returns `true` (assume success, no error)
 * - If `success` key exists and is `true` → returns `true` (success)
 * - If `success` key exists and is `false` → returns `false` (error/failed)
 *
 * @param {unknown} response - The API response to check
 * @returns {boolean} True if successful or no success key, false if explicitly failed
 */
export const isSuccess = (response: unknown): boolean => {
  if (response === null || typeof response !== 'object') return true;
  const responseObj = response as Record<string, unknown>;
  if (!('success' in responseObj)) return true;
  return !!responseObj.success;
};

export enum NoteFormErrorId {
  RequiredField = 'required-field',
  MinimumLength = 'minimum-length',
  MaximumLength = 'maximum-length',
  UnknownError = 'unknown-error',
}

export interface NoteFormError {
  id: NoteFormErrorId;
  message: string;
}

export type NoteFormErrors = Record<string, NoteFormError>;

/**
 * Maps FormErrorId to validation translation keys
 */
const FORM_ERROR_ID_TO_TRANSLATION_KEY = {
  [BASE_SERVER_ERRORS_MAP.MAX_LENGTH]: {
    id: NoteFormErrorId.MaximumLength,
    key: 'common:validation.maximum-length',
    query: (locale: string) => ({ value: toLocalizedNumber(MAX_NOTE_LENGTH, locale) }),
  },
  [BASE_SERVER_ERRORS_MAP.MIN_LENGTH]: {
    id: NoteFormErrorId.MinimumLength,
    key: 'common:validation.minimum-length',
    query: (locale: string) => ({ value: toLocalizedNumber(MIN_NOTE_LENGTH, locale) }),
  },
  [BASE_SERVER_ERRORS_MAP.MISSING]: {
    id: NoteFormErrorId.RequiredField,
    key: 'common:validation.required-field',
    query: () => ({}),
  },
};

const FIELD_KEY_MAP = { body: 'note' };

/**
 * Extracts server validation errors from API response and converts them to form errors.
 * Dynamically handles any validation error code returned by the backend without requiring code changes.
 * New error codes can be handled by adding appropriate translation keys to the locale files.
 *
 * @param {unknown} response - The API error response
 * @param {Translate} t - Translation function for localized error messages
 * @param {string} lang - The current language locale
 * @returns {NoteFormErrors | null} Form errors object if validation errors are found, null otherwise
 */
export const getNoteServerErrors = (
  response: unknown,
  t: Translate,
  lang: string,
): NoteFormErrors | null => {
  if (!isValidationError(response)) return null;

  const errors: NoteFormErrors = {};
  const errorFields = response.details.error.details;

  Object.entries(errorFields).forEach(([field, errorCode]) => {
    const fieldKey = FIELD_KEY_MAP[field as keyof typeof FIELD_KEY_MAP];
    if (!fieldKey) return;

    const fieldName = t(`notes:${fieldKey}`);

    const normalizedErrorCode = String(errorCode).toUpperCase();

    const localizeKey = BASE_SERVER_ERRORS_MAP[normalizedErrorCode as ServerErrorCodes];
    const noteError = FORM_ERROR_ID_TO_TRANSLATION_KEY[localizeKey];

    if (noteError && localizeKey) {
      errors[fieldKey] = {
        id: noteError.id,
        message: t(noteError.key, { ...noteError.query(lang), field: fieldName }),
      };
    } else if (localizeKey) {
      // The error is not common Note Error, We are fallback to global errors
      const localizeText = t(`common:${localizeKey}`, {
        fieldName,
        min: toLocalizedNumber(MIN_NOTE_LENGTH, lang),
        max: toLocalizedNumber(MAX_NOTE_LENGTH, lang),
      });

      // If same that means we don't have a translation for this error code
      if (localizeText !== `common:${localizeKey}`) {
        errors[fieldKey] = { id: NoteFormErrorId.UnknownError, message: localizeText };
      }
    }
  });

  return Object.keys(errors).length === 0 ? null : errors;
};

/**
 * Check if the note form is free of validation errors.
 *
 * @param {NoteFormErrors} errors - Errors keyed by field returned from validation.
 * @returns {boolean} True when no validation errors are present.
 */
export const isNoteFormValid = (errors: NoteFormErrors) => Object.keys(errors).length === 0;
