/* eslint-disable @typescript-eslint/naming-convention, react-func/max-lines-per-function, max-lines */
import { Translate } from 'next-translate';
import { describe, it, expect } from 'vitest';

import { FormErrorId } from './types';
import {
  getTranslationFeedbackErrors,
  isTranslationFeedbackValid,
  MAX_FEEDBACK_CHARS,
  MIN_FEEDBACK_CHARS,
} from './validation';

describe('getTranslationFeedbackErrors', () => {
  const mockT = ((key: string, options?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'validation.required-field': 'The {{field}} field is required',
      'translation-feedback.translation': 'translation',
      'translation-feedback.feedback': 'feedback',
      'validation.minimum-length': 'The {{field}} field must be at least {{value}} characters',
      'validation.maximum-length': 'The {{field}} field must be at most {{value}} characters',
    };
    let result = translations[key] || key;
    if (options) {
      Object.keys(options).forEach((opt) => {
        result = result.replace(`{{${opt}}}`, options[opt] as string);
      });
    }
    return result;
  }) as Translate;

  it('returns empty errors when all fields are valid', () => {
    const errors = getTranslationFeedbackErrors('1', 'Valid feedback text', mockT, 'en');
    expect(errors).toEqual({});
  });

  it('returns translation error when translation is not selected', () => {
    const errors = getTranslationFeedbackErrors('', 'Valid feedback text', mockT, 'en');
    expect(errors).toEqual({
      translation: {
        id: FormErrorId.RequiredField,
        message: 'The translation field is required',
      },
    });
  });

  it('returns feedback error when feedback is empty', () => {
    const errors = getTranslationFeedbackErrors('1', '', mockT, 'en');
    expect(errors).toEqual({
      feedback: {
        id: FormErrorId.RequiredField,
        message: 'The feedback field is required',
      },
    });
  });

  it('returns feedback error when feedback is only whitespace', () => {
    const errors = getTranslationFeedbackErrors('1', '   ', mockT, 'en');
    expect(errors).toEqual({
      feedback: {
        id: FormErrorId.RequiredField,
        message: 'The feedback field is required',
      },
    });
  });

  it('returns feedback error when feedback is too short', () => {
    const shortFeedback = 'a'.repeat(MIN_FEEDBACK_CHARS - 1);
    const errors = getTranslationFeedbackErrors('1', shortFeedback, mockT, 'en');

    if (MIN_FEEDBACK_CHARS > 1) {
      expect(errors).toEqual({
        feedback: {
          id: FormErrorId.MinimumLength,
          message: `The feedback field must be at least ${MIN_FEEDBACK_CHARS} characters`,
        },
      });
    } else {
      expect(errors).toEqual({
        feedback: {
          id: FormErrorId.RequiredField,
          message: 'The feedback field is required',
        },
      });
    }
  });

  it('returns feedback error when feedback is too long', () => {
    const longFeedback = 'a'.repeat(MAX_FEEDBACK_CHARS + 1);
    const errors = getTranslationFeedbackErrors('1', longFeedback, mockT, 'en');
    expect(errors).toEqual({
      feedback: {
        id: FormErrorId.MaximumLength,
        message: 'The feedback field must be at most 10,000 characters',
      },
    });
  });

  it('returns multiple errors when both fields are invalid', () => {
    const errors = getTranslationFeedbackErrors('', '', mockT, 'en');
    expect(errors).toEqual({
      translation: {
        id: FormErrorId.RequiredField,
        message: 'The translation field is required',
      },
      feedback: {
        id: FormErrorId.RequiredField,
        message: 'The feedback field is required',
      },
    });
  });

  it('returns all validation errors when multiple issues exist', () => {
    const errors = getTranslationFeedbackErrors(
      '',
      'a'.repeat(MAX_FEEDBACK_CHARS + 1),
      mockT,
      'en',
    );
    expect(errors).toEqual({
      translation: {
        id: FormErrorId.RequiredField,
        message: 'The translation field is required',
      },
      feedback: {
        id: FormErrorId.MaximumLength,
        message: 'The feedback field must be at most 10,000 characters',
      },
    });
  });
});

describe('isTranslationFeedbackValid', () => {
  it('returns true when errors object is empty', () => {
    const result = isTranslationFeedbackValid({});
    expect(result).toBe(true);
  });

  it('returns false when errors object has translation error', () => {
    const result = isTranslationFeedbackValid({
      translation: {
        id: FormErrorId.RequiredField,
        message: 'Required',
      },
    });
    expect(result).toBe(false);
  });

  it('returns false when errors object has feedback error', () => {
    const result = isTranslationFeedbackValid({
      feedback: {
        id: FormErrorId.RequiredField,
        message: 'Required',
      },
    });
    expect(result).toBe(false);
  });

  it('returns false when errors object has both errors', () => {
    const result = isTranslationFeedbackValid({
      translation: {
        id: FormErrorId.RequiredField,
        message: 'Required',
      },
      feedback: {
        id: FormErrorId.RequiredField,
        message: 'Required',
      },
    });
    expect(result).toBe(false);
  });
});
